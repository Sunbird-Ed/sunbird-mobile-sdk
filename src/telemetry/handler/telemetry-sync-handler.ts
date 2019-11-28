import {ApiConfig, ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {InteractSubType, InteractType, TelemetrySyncStat} from '..';
import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {StringToGzippedString} from '../impl/string-to-gzipped-string';
import {TelemetryEntriesToStringPreprocessor} from '../impl/telemetry-entries-to-string-preprocessor';
import {KeyValueStore} from '../../key-value-store';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {DbService, InsertQuery} from '../../db';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {UniqueId} from '../../db/util/unique-id';
import dayjs from 'dayjs';
import {TelemetryLogger} from '../util/telemetry-logger';
import {TelemetryConfig} from '../config/telemetry-config';
import {SharedPreferences} from '../../util/shared-preferences';
import {CodePush} from '../../preference-keys';
import {AppInfo} from '../../util/app';
import {DeviceRegisterService} from '../../device-register';
import {Observable, of, zip, EMPTY} from 'rxjs';
import {catchError, expand, map, mapTo, mergeMap, reduce, tap} from 'rxjs/operators';

interface ProcessedEventsMeta {
    processedEvents?: string;
    processedEventsSize: number;
    messageId?: string;
}

export class TelemetrySyncHandler implements ApiRequestHandler<boolean, TelemetrySyncStat> {

    public static readonly TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY = 'telemetry_log_min_allowed_offset_key';

    private static readonly LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY = 'last_synced_device_register_attempt_time_stamp';
    private static readonly LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY = 'last_synced_device_register_is_successful';
    private static readonly TELEMETRY_ENDPOINT = '/telemetry';
    private static readonly REGISTER_API_SUCCESS_TTL = 24 * 60 * 60 * 1000;
    private static readonly REGISTER_API_FAILURE_TTL = 60 * 60 * 1000;

    private readonly preprocessors: TelemetrySyncPreprocessor[];
    private readonly telemetryConfig: TelemetryConfig;
    private readonly apiConfig: ApiConfig;

    constructor(
        private dbService: DbService,
        private sdkConfig: SdkConfig,
        private deviceInfo: DeviceInfo,
        private sharedPreferences: SharedPreferences,
        private appInfoService: AppInfo,
        private deviceRegisterService: DeviceRegisterService,
        private keyValueStore?: KeyValueStore,
        private apiService?: ApiService
    ) {
        this.preprocessors = [
            new TelemetryEntriesToStringPreprocessor(),
            new StringToGzippedString()
        ];
        this.telemetryConfig = this.sdkConfig.telemetryConfig;
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    resetDeviceRegisterTTL(): Observable<undefined> {
        return zip(
            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY, ''),
            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY, '')
        ).pipe(
            mapTo(undefined)
        );
    }

    handle(ignoreSyncThreshold: boolean): Observable<TelemetrySyncStat> {
        return this.registerDevice().pipe(
            catchError(() => {
                ignoreSyncThreshold = true;
                return of(undefined);
            }),
            mergeMap(() => {
                return this.hasTelemetryThresholdCrossed().pipe(
                    mergeMap((hasTelemetryThresholdCrossed: boolean) => {
                        if (hasTelemetryThresholdCrossed || ignoreSyncThreshold) {
                            return this.processEventsBatch().pipe(
                                expand((processedEventsCount: number) =>
                                    processedEventsCount ? this.processEventsBatch() : EMPTY
                                ),
                                reduce(() => undefined, undefined),
                                mergeMap(() => this.handleProcessedEventsBatch()),
                                expand((syncStat: TelemetrySyncStat) =>
                                    syncStat.syncedEventCount ? this.handleProcessedEventsBatch() : EMPTY
                                ),
                                reduce((acc: TelemetrySyncStat, currentStat: TelemetrySyncStat) => {
                                    return ({
                                        syncedEventCount: acc.syncedEventCount + currentStat.syncedEventCount,
                                        syncTime: Date.now(),
                                        syncedFileSize: acc.syncedFileSize + currentStat.syncedFileSize
                                    });
                                }, {
                                    syncedEventCount: 0,
                                    syncTime: Date.now(),
                                    syncedFileSize: 0
                                })
                            );
                        }

                        return of({
                            syncedEventCount: 0,
                            syncTime: Date.now(),
                            syncedFileSize: 0
                        });
                    })
                );
            })
        );
    }

    public processEventsBatch(): Observable<number> {
        return this.fetchEvents().pipe(
            mergeMap((events) =>
                this.processEvents(events).pipe(
                    mergeMap((processedEventsMeta) =>
                        this.persistProcessedEvents(processedEventsMeta, processedEventsMeta.processedEventsSize).pipe(
                            mergeMap(() => this.deleteEvents(events)),
                            mapTo(events.length)
                        )
                    )
                )
            )
        );
    }

    private registerDevice(): Observable<undefined> {
        return zip(
            this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY),
            this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY),
        ).pipe(
            mergeMap((results: any) => {
                const lastSyncDeviceRegisterAttemptTimestamp = results[0];
                const lastSyncDeviceRegisterIsSuccessful = results[1];

                if (lastSyncDeviceRegisterAttemptTimestamp && lastSyncDeviceRegisterIsSuccessful) {
                    const offset = lastSyncDeviceRegisterIsSuccessful === 'false' ?
                        TelemetrySyncHandler.REGISTER_API_FAILURE_TTL : TelemetrySyncHandler.REGISTER_API_SUCCESS_TTL;

                    if (Math.abs(parseInt(lastSyncDeviceRegisterAttemptTimestamp, 10) - Date.now()) < offset) {
                        return of(undefined);
                    }
                }

                return this.deviceRegisterService.registerDevice().pipe(
                    tap(async (res) => {
                        const actions = res.result.actions;
                        actions.forEach(element => {
                            if (element.type === 'experiment' && element.key) {
                                this.sharedPreferences.putString(CodePush.DEPLOYMENT_KEY,
                                    element.data.key).toPromise();
                            }
                        });
                        const serverTime = new Date(res.ts).getTime();
                        const now = Date.now();
                        const currentOffset = serverTime - now;
                        const allowedOffset =
                            Math.abs(currentOffset) > this.telemetryConfig.telemetryLogMinAllowedOffset ? currentOffset : 0;
                        if (allowedOffset) {
                            await TelemetryLogger.log.interact({
                                type: InteractType.OTHER,
                                subType: InteractSubType.DEVICE_TIME_OFFSET_FOUND,
                                env: 'sdk',
                                pageId: 'sdk',
                                id: 'sdk',
                                valueMap: {
                                    deviceTime: now,
                                    offsetTime: allowedOffset
                                }
                            }).toPromise();
                            await this.keyValueStore!
                                .setValue(TelemetrySyncHandler.TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY, allowedOffset + '').toPromise();
                        }
                    }),
                    mergeMap(() => {
                        return zip(
                            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY,
                                Date.now() + ''),
                            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY,
                                'true')
                        ).pipe(
                            mapTo(undefined)
                        );
                    }),
                    catchError((e) => {
                        return zip(
                            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY,
                                Date.now() + ''),
                            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY,
                                'false')
                        ).pipe(
                            mergeMap(() => {
                                console.error(e);
                                throw new Error('Device Registration Failed');
                            })
                        );
                    })
                );
            })
        );
    }

    private hasTelemetryThresholdCrossed(): Observable<boolean> {
        return this.dbService.execute(`
            SELECT count(*) as COUNT FROM ${TelemetryEntry.TABLE_NAME}`
        ).pipe(
            map((result) => {
                if (result && result[0] && (result[0]['COUNT'] >= this.telemetryConfig.telemetrySyncThreshold)) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    private fetchEvents(): Observable<TelemetryEntry.SchemaMap[]> {
        return this.dbService.execute(`
            SELECT * FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry.COLUMN_NAME_PRIORITY} = (SELECT MIN (${TelemetryEntry.COLUMN_NAME_PRIORITY})
            FROM ${TelemetryEntry.TABLE_NAME})
            ORDER BY ${TelemetryEntry.COLUMN_NAME_TIMESTAMP}
            LIMIT ${this.telemetryConfig.telemetrySyncBandwidth}`
        );
    }

    private processEvents(events: TelemetryEntry.SchemaMap[]): Observable<ProcessedEventsMeta> {
        if (!events.length) {
            return of({
                processedEventsSize: 0
            });
        }

        const messageId = UniqueId.generateUniqueId();
        return of({
            processedEvents: this.preprocessors.reduce<any>((acc, current) => {
                return current.process(acc);
            }, {
                id: 'ekstep.telemetry',
                ver: '1.0',
                ts: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]'),
                events: events.map((e) => JSON.parse(e[TelemetryEntry.COLUMN_NAME_EVENT])),
                params: {
                    did: this.deviceInfo.getDeviceID(),
                    msgid: messageId,
                    key: '',
                    requesterId: ''
                }
            }),
            processedEventsSize: events.length,
            messageId
        });
    }

    private persistProcessedEvents({processedEvents, messageId}: ProcessedEventsMeta, eventsCount: number): Observable<undefined> {
        if (!processedEvents) {
            return of(undefined);
        }

        const insertQuery: InsertQuery = {
            table: TelemetryProcessedEntry.TABLE_NAME,
            modelJson: {
                [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: messageId,
                [TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS]: eventsCount,
                [TelemetryEntry.COLUMN_NAME_PRIORITY]: 1,
                [TelemetryProcessedEntry.COLUMN_NAME_DATA]: processedEvents
            }
        };

        return this.dbService.insert(insertQuery).pipe(
            mapTo(undefined)
        );
    }

    private deleteEvents(events: TelemetryEntry.SchemaMap[]): Observable<undefined> {
        if (!events.length) {
            return of(undefined);
        }

        return this.dbService.execute(`
            DELETE FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry._ID} IN (${events.map((event) => event[TelemetryEntry._ID]).join(',')})
        `);
    }

    private handleProcessedEventsBatch(): Observable<TelemetrySyncStat> {
        return this.fetchProcessedEventsBatch().pipe(
            mergeMap(processedEventsBatchEntry =>
                this.syncProcessedEvent(processedEventsBatchEntry).pipe(
                    mergeMap((syncStat?: TelemetrySyncStat) =>
                        this.deleteProcessedEvent(processedEventsBatchEntry).pipe(
                            mapTo(syncStat || {
                                syncedEventCount: 0,
                                syncTime: Date.now(),
                                syncedFileSize: 0
                            })
                        )
                    ),
                    catchError(() => {
                        return of({
                            syncedEventCount: 0,
                            syncTime: Date.now(),
                            syncedFileSize: 0
                        });
                    })
                )
            )
        );
    }

    private fetchProcessedEventsBatch(): Observable<TelemetryProcessedEntry.SchemaMap | undefined> {
        return this.dbService.read({
            table: TelemetryProcessedEntry.TABLE_NAME,
            selection: '',
            selectionArgs: [],
            limit: '1'
        }).pipe(
            map((r: TelemetryProcessedEntry.SchemaMap[]) => r && r[0])
        );
    }

    private syncProcessedEvent(processedEventsBatchEntry?: TelemetryProcessedEntry.SchemaMap): Observable<TelemetrySyncStat | undefined> {
        if (!processedEventsBatchEntry) {
            return of(undefined);
        }

        const gzippedCharData = processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_DATA].split('').map((c) => {
            return c.charCodeAt(0);
        });
        const body = new Uint8Array(gzippedCharData);

        // const body = JSON.parse(pako.ungzip(processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_DATA], {to: 'string'}));

        const apiRequest: Request = new Request.Builder()
            .withHost(this.telemetryConfig.host!)
            .withType(HttpRequestType.POST)
            .withPath(this.telemetryConfig.apiPath + TelemetrySyncHandler.TELEMETRY_ENDPOINT)
            .withBody(body)
            .withApiToken(true)
            .build();

        return this.apiService!.fetch(apiRequest).pipe(
            tap(async (res) => {
                const lastSyncDeviceRegisterIsSuccessful =
                    await this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY).toPromise();

                if (lastSyncDeviceRegisterIsSuccessful === 'false') {
                    const serverTime = new Date(res.body.ets).getTime();
                    const now = Date.now();
                    const currentOffset = serverTime - now;
                    const allowedOffset =
                        Math.abs(currentOffset) > this.telemetryConfig.telemetryLogMinAllowedOffset ? currentOffset : 0;
                    if (allowedOffset) {
                        await this.keyValueStore!
                            .setValue(TelemetrySyncHandler.TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY, allowedOffset + '').toPromise();
                    }
                }
            }),
            map(() => ({
                syncedEventCount: processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS],
                syncTime: Date.now(),
                syncedFileSize: new TextEncoder().encode(processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_DATA]).length
            }))
        );
    }

    private deleteProcessedEvent(processedEventsBatchEntry?: TelemetryProcessedEntry.SchemaMap): Observable<undefined> {
        if (!processedEventsBatchEntry) {
            return of(undefined);
        }

        return this.dbService.delete({
            table: TelemetryProcessedEntry.TABLE_NAME,
            selection: `_id = ?`,
            selectionArgs: [processedEventsBatchEntry[TelemetryProcessedEntry._ID]]
        });
    }
}
