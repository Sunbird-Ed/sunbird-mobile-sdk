import {DbService, InsertQuery} from '../../db';
import {
    Context,
    ImportTelemetryContext,
    SunbirdTelemetry,
    TelemetryAuditRequest,
    TelemetryDecorator,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryInterruptRequest,
    TelemetryLogRequest,
    TelemetryService,
    TelemetryShareRequest,
    TelemetryStartRequest,
    TelemetryStat, TelemetrySummaryRequest,
    TelemetrySyncRequest,
    TelemetrySyncStat
} from '..';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {ProfileService, ProfileSession} from '../../profile';
import {GroupServiceDeprecated, GroupSessionDeprecated} from '../../group-deprecated';
import {TelemetrySyncHandler} from '../handler/telemetry-sync-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService, Response} from '../../api';
import {TelemetryConfig} from '../config/telemetry-config';
import {DeviceInfo} from '../../util/device';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {FileService} from '../../util/file/def/file-service';
import {ValidateTelemetryMetadata} from '../handler/import/validate-telemetry-metadata';
import {TelemetryEventType} from '../def/telemetry-event';
import {TransportProcessedTelemetry} from '../handler/import/transport-processed-telemetry';
import {UpdateImportedTelemetryMetadata} from '../handler/import/update-imported-telemetry-metadata';
import {GenerateImportTelemetryShare} from '../handler/import/generate-import-telemetry-share';
import {FrameworkService} from '../../framework';
import {NetworkInfoService, NetworkStatus} from '../../util/network';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {ErrorLoggerService} from '../../error';
import {SharedPreferences} from '../../util/shared-preferences';
import {AppInfo} from '../../util/app';
import {DeviceRegisterService} from '../../device-register';
import {catchError, map, mapTo, mergeMap, take, tap} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, defer, from, Observable, Observer, of, zip} from 'rxjs';
import {ApiKeys, TelemetryKeys} from '../../preference-keys';
import {TelemetryAutoSyncServiceImpl} from '../util/telemetry-auto-sync-service-impl';
import {CourseService} from '../../course';
import {NetworkQueue} from '../../api/network-queue';
import {CorrelationData} from '../def/telemetry-model';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {SdkServicePreInitDelegate} from '../../sdk-service-pre-init-delegate';
import {ApiTokenHandler} from '../../api/handlers/api-token-handler';
import {AuthUtil} from '../../auth/util/auth-util';


@injectable()
export class TelemetryServiceImpl implements TelemetryService, SdkServiceOnInitDelegate, SdkServicePreInitDelegate {
    private _lastSyncedTimestamp$: BehaviorSubject<number | undefined>;
    private telemetryAutoSyncService?: TelemetryAutoSyncServiceImpl;
    private telemetryConfig: TelemetryConfig;
    private campaignParameters: CorrelationData[] = [];
    private globalCdata: CorrelationData[] = [];

    get autoSync() {
        if (!this.telemetryAutoSyncService) {
            this.telemetryAutoSyncService = new TelemetryAutoSyncServiceImpl(this, this.sharedPreferences);
        }

        return this.telemetryAutoSyncService;
    }

    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.TELEMETRY_DECORATOR) private decorator: TelemetryDecorator,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.GROUP_SERVICE_DEPRECATED) private groupService: GroupServiceDeprecated,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.NETWORKINFO_SERVICE) private networkInfoService: NetworkInfoService,
        @inject(InjectionTokens.ERROR_LOGGER_SERVICE) private errorLoggerService: ErrorLoggerService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.APP_INFO) private appInfoService: AppInfo,
        @inject(InjectionTokens.DEVICE_REGISTER_SERVICE) private deviceRegisterService: DeviceRegisterService,
        @inject(InjectionTokens.COURSE_SERVICE) private courseService: CourseService,
        @inject(InjectionTokens.NETWORK_QUEUE) private networkQueue: NetworkQueue,
    ) {
        this.telemetryConfig = this.sdkConfig.telemetryConfig;
        this._lastSyncedTimestamp$ = new BehaviorSubject<number | undefined>(undefined);
    }

    preInit(): Observable<undefined> {
        return defer(async () => {
            await this.getInitialUtmParameters().then((parameters) => {
                if (parameters && parameters.length) {
                    this.updateCampaignParameters(parameters);
                }
            });
            return undefined;
        });
    }

    onInit(): Observable<undefined> {
        return combineLatest([
            defer(async () => {
                const lastSyncTimestamp = await this.sharedPreferences.getString(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP).toPromise();
                if (lastSyncTimestamp) {
                    try {
                        this._lastSyncedTimestamp$.next(parseInt(lastSyncTimestamp, 10));
                    } catch (e) {
                        console.error(e);
                    }
                }
                return undefined;
            }),
            new Observable((observer: Observer<undefined>) => {
                sbsync.onAuthorizationError(async (response) => {
                    const error = response.network_queue_error;
                    if (error) {
                        observer.next(error);
                    }
                }, async (error) => {
                });
            }).pipe(
                mergeMap((error) => {
                    if (error === 'API_TOKEN_EXPIRED') {
                        return new ApiTokenHandler(this.sdkConfig.apiConfig, this.apiService, this.deviceInfo).refreshAuthToken().pipe(
                            mergeMap((bearerToken) => {
                                return this.sharedPreferences.putString(ApiKeys.KEY_API_TOKEN, bearerToken);
                            }),
                            catchError(() => of(undefined))
                        );
                    } else {
                        return from(new AuthUtil(this.sdkConfig.apiConfig, this.apiService,
                            this.sharedPreferences,
                            this.eventsBusService).refreshSession()).pipe(
                            catchError(() => of(undefined))
                        );
                    }
                })
            )
        ]).pipe(mapTo(undefined));

    }

    saveTelemetry(request: string): Observable<boolean> {
        return defer(() => {
            try {
                const telemetry: SunbirdTelemetry.Telemetry = JSON.parse(request);
                return this.decorateAndPersist(telemetry);
            } catch (e) {
                console.error(e);
                return of(false);
            }
        });
    }

    audit({env, actor, currentState, updatedProperties, type, objId, objType, objVer, correlationData, rollUp}:
              TelemetryAuditRequest): Observable<boolean> {
        const audit = new SunbirdTelemetry.Audit(env, actor, currentState, updatedProperties, type, objId,
            objType, objVer, correlationData, rollUp);
        return this.decorateAndPersist(audit);
    }

    end({
            type, mode, duration, pageId, summaryList, env,
            objId, objType, objVer, rollup, correlationData
        }: TelemetryEndRequest): Observable<boolean> {
        const end = new SunbirdTelemetry.End(type, mode, duration, pageId, summaryList, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(end);
    }

    error(request: TelemetryErrorRequest): Observable<boolean> {
        const error = new SunbirdTelemetry.Error(request.errorCode, request.errorType, request.stacktrace, request.pageId);
        this.errorLoggerService.logError(request).toPromise().catch((e) => console.error(e));
        return this.decorateAndPersist(error);
    }

    impression({
                   type, subType, pageId, visits, env, objId,
                   objType, objVer, rollup, correlationData
               }: TelemetryImpressionRequest): Observable<boolean> {
        const impression = new SunbirdTelemetry.Impression(type, subType, pageId, visits, env, objId,
            objType, objVer, rollup!, correlationData);
        return this.decorateAndPersist(impression);
    }

    interact({
                 type, subType, id, pageId, pos, env, rollup,
                 valueMap, correlationData, objId, objType, objVer
             }: TelemetryInteractRequest): Observable<boolean> {
        const interact = new SunbirdTelemetry.Interact(type, subType, id, pageId, pos, valueMap, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(interact);
    }

    log({type, level, message, pageId, params, env, actorType}: TelemetryLogRequest): Observable<boolean> {
        const log = new SunbirdTelemetry.Log(type, level, message, pageId, params, env, actorType);
        return this.decorateAndPersist(log);
    }

    share({dir, type, items, correlationData, objId, objType, objVer, rollUp}: TelemetryShareRequest): Observable<boolean> {
        const share = new SunbirdTelemetry.Share(dir, type, [], correlationData, objId, objType, objVer, rollUp);
        items.forEach((item) => {
            share.addItem(item.type, item.origin, item.identifier, item.pkgVersion, item.transferCount, item.size);
        });
        return this.decorateAndPersist(share);
    }

    feedback({rating, comments, env, objId, objType, objVer, commentid, commenttxt}: TelemetryFeedbackRequest): Observable<boolean> {
        const feedback = new SunbirdTelemetry.Feedback(rating, comments, env, objId,
            objType, objVer, commentid, commenttxt);
        return this.decorateAndPersist(feedback);
    }

    start({
              type, deviceSpecification, loc, mode, duration, pageId, env,
              objId, objType, objVer, rollup, correlationData
          }: TelemetryStartRequest): Observable<boolean> {
        const start = new SunbirdTelemetry.Start(type, deviceSpecification, loc, mode, duration, pageId, env, objId,
            objType, objVer, rollup, correlationData);
        return this.decorateAndPersist(start);
    }

    summary({
                type, starttime, endtime, timespent, pageviews,
                interactions, env, mode, envsummary, eventsummary, pagesummary, extra, correlationData,
        objId, objType, objVer, rollup
            }: TelemetrySummaryRequest): Observable<boolean> {
        const summary = new SunbirdTelemetry.Summary(type, starttime, endtime, timespent, pageviews,
            interactions, env, mode, envsummary, eventsummary, pagesummary, extra, correlationData,
            objId, objType, objVer, rollup);
        return this.decorateAndPersist(summary);
    }


    interrupt({type, pageId}: TelemetryInterruptRequest): Observable<boolean> {
        const interrupt = new SunbirdTelemetry.Interrupt(type, pageId);
        return this.decorateAndPersist(interrupt);
    }

    importTelemetry(importTelemetryRequest: TelemetryImportRequest): Observable<boolean> {
        const importTelemetryContext: ImportTelemetryContext = {
            sourceDBFilePath: importTelemetryRequest.sourceFilePath
        };
        return from(
            new ValidateTelemetryMetadata(this.dbService).execute(importTelemetryContext).then((importResponse: Response) => {
                return new TransportProcessedTelemetry(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new UpdateImportedTelemetryMetadata(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new UpdateImportedTelemetryMetadata(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new GenerateImportTelemetryShare(this.dbService, this).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return true;
            }).catch((e) => {
                console.error(e);
                return false;
            })
        );
    }

    getTelemetryStat(): Observable<TelemetryStat> {
        const telemetryCountQuery = `
            SELECT COUNT(*) as TELEMETRY_COUNT
            FROM ${TelemetryEntry.TABLE_NAME}
        `;

        const processedTelemetryCountQuery = `
            SELECT SUM(${TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS}) as PROCESSED_TELEMETRY_COUNT
            FROM ${TelemetryProcessedEntry.TABLE_NAME}
        `;

        return zip(
            this.dbService.execute(telemetryCountQuery),
            this.dbService.execute(processedTelemetryCountQuery),
            this.keyValueStore.getValue(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP)
        ).pipe(
            map((results) => {
                const telemetryCount: number = results[0][0]['TELEMETRY_COUNT'];
                const processedTelemetryCount: number = results[1][0]['PROCESSED_TELEMETRY_COUNT'];
                const lastSyncedTimestamp: number = results[2] ? parseInt(results[2]!, 10) : 0;

                return {
                    unSyncedEventCount: telemetryCount + processedTelemetryCount,
                    lastSyncTime: lastSyncedTimestamp
                };
            })
        );
    }

    resetDeviceRegisterTTL(): Observable<undefined> {
        return new TelemetrySyncHandler(
            this.dbService,
            this.sdkConfig,
            this.deviceInfo,
            this.sharedPreferences,
            this.appInfoService,
            this.deviceRegisterService,
            this.keyValueStore,
            this.apiService,
            this.networkQueue
        ).resetDeviceRegisterTTL();
    }

    sync(telemetrySyncRequest: TelemetrySyncRequest = {
        ignoreSyncThreshold: false,
        ignoreAutoSyncMode: false
    }): Observable<TelemetrySyncStat> {
        return this.networkInfoService.networkStatus$.pipe(
            take(1),
            mergeMap((networkStatus) => {
                if (networkStatus === NetworkStatus.ONLINE) {
                    telemetrySyncRequest.ignoreSyncThreshold = true;
                }

                return of(telemetrySyncRequest);
            }),
            mergeMap((request) => {
                return new TelemetrySyncHandler(
                    this.dbService,
                    this.sdkConfig,
                    this.deviceInfo,
                    this.sharedPreferences,
                    this.appInfoService,
                    this.deviceRegisterService,
                    this.keyValueStore,
                    this.apiService,
                    this.networkQueue
                ).handle(request).pipe(
                    tap(async (syncStat) => {
                        if (!syncStat.error && syncStat.syncedEventCount) {
                            const now = Date.now();
                            await this.sharedPreferences.putString(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP, now + '').toPromise();
                            this._lastSyncedTimestamp$.next(now);
                        }
                    })
                );
            })
        );
    }

    lastSyncedTimestamp(): Observable<number | undefined> {
        return this._lastSyncedTimestamp$.asObservable();
    }

    buildContext(): Observable<Context> {
        return this.profileService.getActiveProfileSession().pipe(
            map((session) => {
                return this.decorator.buildContext(
                    session!.sid,
                    this.frameworkService.activeChannelId!, new Context());
            })
        );
    }

    private decorateAndPersist(telemetry: SunbirdTelemetry.Telemetry): Observable<boolean> {
        return zip(
            this.profileService.getActiveProfileSession(),
            this.groupService.getActiveGroupSession()
        ).pipe(
            mergeMap((sessions) => {
                const profileSession: ProfileSession | undefined = sessions[0];
                const groupSession: GroupSessionDeprecated | undefined = sessions[1];

                return this.keyValueStore.getValue(TelemetrySyncHandler.TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY).pipe(
                    mergeMap((offset?: string) => {
                        offset = offset || '0';

                        const insertQuery: InsertQuery = {
                            table: TelemetryEntry.TABLE_NAME,
                            modelJson: this.decorator.prepare(this.decorator.decorate(
                                telemetry, profileSession, groupSession && groupSession.gid, Number(offset),
                                this.frameworkService.activeChannelId, this.campaignParameters, this.globalCdata
                            ), 1)
                        };
                        return this.dbService.insert(insertQuery).pipe(
                            tap(() => this.eventsBusService.emit({
                                namespace: EventNamespace.TELEMETRY,
                                event: {
                                    type: TelemetryEventType.SAVE,
                                    payload: telemetry
                                }
                            })),
                            map((count) => count > 1)
                        );
                    })
                );
            })
        );
    }

    updateCampaignParameters(params: CorrelationData[]) {
        this.campaignParameters = params;
    }

    populateGlobalCorRelationData(params: CorrelationData[]) {
        this.globalCdata = params;
    }

    private getInitialUtmParameters(): Promise<CorrelationData[]> {
        return new Promise<CorrelationData[]>((resolve, reject) => {
            try {
                // TODO: Capacitor temp fix
                resolve([{id: "",
                        type: ""}])
                // window.sbutility.getUtmInfo((response: { val: CorrelationData[] }) => {
                //     resolve(response.val);
                // }, err => {
                //     resolve([{id: "",
                //         type: ""}])
                //     // reject(err);
                // });
            } catch (xc) {
                reject(xc);
            }
        });
    }
}
