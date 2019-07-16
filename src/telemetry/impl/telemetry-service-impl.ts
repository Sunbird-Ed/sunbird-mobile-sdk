import {DbService, InsertQuery} from '../../db';
import {
    ExportTelemetryContext,
    ImportTelemetryContext,
    SunbirdTelemetry,
    TelemetryAuditRequest,
    TelemetryDecorator,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryExportRequest,
    TelemetryExportResponse,
    TelemetryFeedbackRequest,
    TelemetryImportRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryInterruptRequest,
    TelemetryLogRequest,
    TelemetryService,
    TelemetryShareRequest,
    TelemetryStartRequest,
    TelemetryStat,
    TelemetrySyncStat
} from '..';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {Observable} from 'rxjs';
import {ProfileService, ProfileSession} from '../../profile';
import {GroupService, GroupSession} from '../../group';
import {TelemetrySyncHandler} from '../handler/telemetry-sync-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService, Response} from '../../api';
import {TelemetryConfig} from '../config/telemetry-config';
import {DeviceInfo} from '../../util/device';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {FileService} from '../../util/file/def/file-service';
import {CreateTelemetryExportFile} from '../handler/export/create-telemetry-export-file';
import {CopyDatabase} from '../handler/export/copy-database';
import {CreateMetaData} from '../handler/export/create-meta-data';
import {CleanupExportedFile} from '../handler/export/cleanup-exported-file';
import {GenerateShareTelemetry} from '../handler/export/generate-share-telemetry';
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
import {ErrorLoggerService} from '../../util/error-stack';
import {SharedPreferences} from '../../util/shared-preferences';

@injectable()
export class TelemetryServiceImpl implements TelemetryService {
    private static readonly KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP = 'telemetry_last_synced_time_stamp';
    private telemetryConfig: TelemetryConfig;

    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.TELEMETRY_DECORATOR) private decorator: TelemetryDecorator,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.GROUP_SERVICE) private groupService: GroupService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.NETWORKINFO_SERVICE) private networkInfoService: NetworkInfoService,
        @inject(InjectionTokens.ERROR_LOGGER_SERVICE) private errorLoggerService: ErrorLoggerService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences
    ) {
        this.telemetryConfig = this.sdkConfig.telemetryConfig;
    }

    saveTelemetry(request: string): Observable<boolean> {
        return Observable.defer(() => {
            try {
                const telemetry: SunbirdTelemetry.Telemetry = JSON.parse(request);
                return this.decorateAndPersist(telemetry);
            } catch (e) {
                console.error(e);
                return Observable.of(false);
            }
        });
    }

    audit({env, actor, currentState, updatedProperties, objId, objType, objVer, correlationData}:
              TelemetryAuditRequest): Observable<boolean> {
        const audit = new SunbirdTelemetry.Audit(env, actor, currentState, updatedProperties, objId, objType, objVer, correlationData);
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

    share({dir, type, items, correlationData}: TelemetryShareRequest): Observable<boolean> {
        const share = new SunbirdTelemetry.Share(dir, type, [], correlationData);
        items.forEach((item) => {
            share.addItem(item.type, item.origin, item.identifier, item.pkgVersion, item.transferCount, item.size);
        });
        return this.decorateAndPersist(share);
    }

    feedback({rating, comments, env, objId, objType, objVer}: TelemetryFeedbackRequest): Observable<boolean> {
        const feedback = new SunbirdTelemetry.Feedback(rating, comments, env, objId,
            objType, objVer);
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


    interrupt({type, pageId}: TelemetryInterruptRequest): Observable<boolean> {
        const interrupt = new SunbirdTelemetry.Interrupt(type, pageId);
        return this.decorateAndPersist(interrupt);
    }

    importTelemetry(importTelemetryRequest: TelemetryImportRequest): Observable<boolean> {
        const importTelemetryContext: ImportTelemetryContext = {
            sourceDBFilePath: importTelemetryRequest.sourceFilePath
        };
        return Observable.fromPromise(
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

    exportTelemetry(telemetryExportRequest: TelemetryExportRequest): Observable<TelemetryExportResponse> {
        const exportTelemetryContext: ExportTelemetryContext = {destinationFolder: telemetryExportRequest.destinationFolder};
        const telemetrySyncHandler: TelemetrySyncHandler = new TelemetrySyncHandler(
            this.dbService,
            this.sdkConfig,
            this.deviceInfo,
            this.frameworkService,
            this.sharedPreferences
        );
        return Observable.fromPromise(
            telemetrySyncHandler.processEventsBatch().expand((processedEventsCount: number) =>
                processedEventsCount ? telemetrySyncHandler.processEventsBatch() : Observable.empty()
            ).toPromise().then(() => {
                return new CreateTelemetryExportFile(this.fileService, this.deviceInfo).execute(exportTelemetryContext);
            }).then((exportResponse: Response) => {
                const res: TelemetryExportResponse = {exportedFilePath: 'yep'};
                return new CopyDatabase(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CreateMetaData(this.dbService, this.fileService, this.deviceInfo).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new CleanupExportedFile(this.dbService, this.fileService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                return new GenerateShareTelemetry(this.dbService, this).execute(exportResponse.body);
            }).then((exportResponse: Response<ExportTelemetryContext>) => {
                const res: TelemetryExportResponse = {exportedFilePath: exportResponse.body.destinationDBFilePath!};
                return res;
            }));
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

        return Observable.zip(
            this.dbService.execute(telemetryCountQuery),
            this.dbService.execute(processedTelemetryCountQuery),
            this.keyValueStore.getValue(TelemetryServiceImpl.KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP)
        ).map((results) => {
            const telemetryCount: number = results[0][0]['TELEMETRY_COUNT'];
            const processedTelemetryCount: number = results[1][0]['PROCESSED_TELEMETRY_COUNT'];
            const lastSyncedTimestamp: number = results[2] ? parseInt(results[2]!, 10) : 0;

            return {
                unSyncedEventCount: telemetryCount + processedTelemetryCount,
                lastSyncTime: lastSyncedTimestamp
            };
        });
    }

    resetDeviceRegisterTTL(): Observable<undefined> {
        return new TelemetrySyncHandler(
            this.dbService,
            this.sdkConfig,
            this.deviceInfo,
            this.frameworkService,
            this.sharedPreferences,
            this.keyValueStore,
            this.apiService
        ).resetDeviceRegisterTTL();
    }

    sync(ignoreSyncThreshold: boolean = false): Observable<TelemetrySyncStat> {
        return this.networkInfoService.networkStatus$
            .take(1)
            .mergeMap((networkStatus) => {
                if (networkStatus === NetworkStatus.ONLINE) {
                    return Observable.of(true);
                }

                return Observable.of(ignoreSyncThreshold);
            })
            .mergeMap((shouldIgnoreSyncThreshold) => {
                return new TelemetrySyncHandler(
                    this.dbService,
                    this.sdkConfig,
                    this.deviceInfo,
                    this.frameworkService,
                    this.sharedPreferences,
                    this.keyValueStore,
                    this.apiService
                ).handle(shouldIgnoreSyncThreshold);
            })
            .mergeMap((telemetrySyncStat) =>
                this.keyValueStore.setValue(TelemetryServiceImpl.KEY_TELEMETRY_LAST_SYNCED_TIME_STAMP, telemetrySyncStat.syncTime + '')
                    .mapTo(telemetrySyncStat)
            );
    }

    private decorateAndPersist(telemetry: SunbirdTelemetry.Telemetry): Observable<boolean> {
        return Observable.zip(
            this.profileService.getActiveProfileSession(),
            this.groupService.getActiveGroupSession()
        ).mergeMap((sessions) => {
            const profileSession: ProfileSession | undefined = sessions[0];
            const groupSession: GroupSession | undefined = sessions[1];

            return this.keyValueStore.getValue(TelemetrySyncHandler.TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY)
                .mergeMap((offset?: string) => {
                    offset = offset || '0';

                    const insertQuery: InsertQuery = {
                        table: TelemetryEntry.TABLE_NAME,
                        modelJson: this.decorator.prepare(this.decorator.decorate(telemetry, profileSession!.uid,
                            profileSession!.sid, groupSession && groupSession.gid, Number(offset),
                            this.frameworkService.activeChannelId), 1)
                    };
                    return this.dbService.insert(insertQuery)
                        .do(() => this.eventsBusService.emit({
                            namespace: EventNamespace.TELEMETRY,
                            event: {
                                type: TelemetryEventType.SAVE,
                                payload: telemetry
                            }
                        }))
                        .map((count) => count > 1);
                });
        });
    }


}
