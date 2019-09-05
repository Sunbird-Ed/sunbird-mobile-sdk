import {ApiRequestHandler, ApiService, HttpRequestType, Request, ApiConfig} from '../../api';
import {InteractSubType, InteractType, TelemetrySyncStat} from '..';
import {Observable} from 'rxjs';
import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {StringToGzippedString} from '../impl/string-to-gzipped-string';
import {TelemetryEntriesToStringPreprocessor} from '../impl/telemetry-entries-to-string-preprocessor';
import {KeyValueStore} from '../../key-value-store';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo, DeviceSpec} from '../../util/device';
import {DbService, InsertQuery} from '../../db';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {UniqueId} from '../../db/util/unique-id';
import moment from 'moment';
import {FrameworkService} from '../../framework';
import {TelemetryLogger} from '../util/telemetry-logger';
import COLUMN_NAME_MSG_ID = TelemetryProcessedEntry.COLUMN_NAME_MSG_ID;
import COLUMN_NAME_NUMBER_OF_EVENTS = TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS;
import COLUMN_NAME_PRIORITY = TelemetryEntry.COLUMN_NAME_PRIORITY;
import COLUMN_NAME_DATA = TelemetryProcessedEntry.COLUMN_NAME_DATA;
import COLUMN_NAME_EVENT = TelemetryEntry.COLUMN_NAME_EVENT;
import { TelemetryConfig } from '../config/telemetry-config';
import { SharedPreferences } from '../../util/shared-preferences';
import { CodePush } from '../../preference-keys';
import {AppInfo} from "../../util/app";

// import * as pako from 'pako';

interface ProcessedEventsMeta {
    processedEvents?: string;
    processedEventsSize: number;
    messageId?: string;
}

interface DeviceRegisterResponse {
    ts: string;
}

export class TelemetrySyncHandler implements ApiRequestHandler<boolean, TelemetrySyncStat> {
    public static readonly TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY = 'telemetry_log_min_allowed_offset_key';
    private static readonly LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY = 'last_synced_device_register_attempt_time_stamp';
    private static readonly LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY = 'last_synced_device_register_is_successful';
    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';
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
        private frameworkService: FrameworkService,
        private sharedPreferences: SharedPreferences,
        private appInfoService: AppInfo,
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
        return Observable.zip(
            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY, ''),
            this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY, '')
        ).mapTo(undefined);
    }

    handle(ignoreSyncThreshold: boolean): Observable<TelemetrySyncStat> {
        return this.registerDevice()
            .catch(() => {
                ignoreSyncThreshold = true;
                return Observable.of(undefined);
            })
            .mergeMap(() => {
                return this.hasTelemetryThresholdCrossed()
                    .mergeMap((hasTelemetryThresholdCrossed: boolean) => {
                        if (hasTelemetryThresholdCrossed || ignoreSyncThreshold) {
                            return this.processEventsBatch()
                                .expand((processedEventsCount: number) =>
                                    processedEventsCount ? this.processEventsBatch() : Observable.empty()
                                )
                                .reduce(() => undefined, undefined)
                                .mergeMap(() => this.handleProcessedEventsBatch())
                                .expand((syncStat: TelemetrySyncStat) =>
                                    syncStat.syncedEventCount ? this.handleProcessedEventsBatch() : Observable.empty()
                                )
                                .reduce((acc: TelemetrySyncStat, currentStat: TelemetrySyncStat) => {
                                    return ({
                                        syncedEventCount: acc.syncedEventCount + currentStat.syncedEventCount,
                                        syncTime: Date.now(),
                                        syncedFileSize: acc.syncedFileSize + currentStat.syncedFileSize
                                    });
                                }, {
                                    syncedEventCount: 0,
                                    syncTime: Date.now(),
                                    syncedFileSize: 0
                                });
                        }

                        return Observable.of({
                            syncedEventCount: 0,
                            syncTime: Date.now(),
                            syncedFileSize: 0
                        });
                    });
            });
    }

    private registerDevice(): Observable<undefined> {
        return Observable.zip(
            this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY),
            this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY),
            this.deviceInfo.getDeviceSpec(),
            this.frameworkService.getActiveChannelId(),
            this.appInfoService.getFirstAccessTimestamp(),
        ).mergeMap((results: any) => {
            const lastSyncDeviceRegisterAttemptTimestamp = results[0];
            const lastSyncDeviceRegisterIsSuccessful = results[1];
            const deviceSpec: DeviceSpec = results[2];
            const activeChannelId: string = results[3];
            const firstAccessTimestamp = results[4];

            if (lastSyncDeviceRegisterAttemptTimestamp && lastSyncDeviceRegisterIsSuccessful) {
                const offset = lastSyncDeviceRegisterIsSuccessful === 'false' ?
                    TelemetrySyncHandler.REGISTER_API_FAILURE_TTL : TelemetrySyncHandler.REGISTER_API_SUCCESS_TTL;

                if (Math.abs(parseInt(lastSyncDeviceRegisterAttemptTimestamp, 10) - Date.now()) < offset) {
                    return Observable.of(undefined);
                }
            }

            const apiRequest: Request = new Request.Builder()
                .withType(HttpRequestType.POST)
                .withHost(this.telemetryConfig!.deviceRegisterHost)
                .withPath(this.telemetryConfig!.deviceRegisterApiPath +
                    TelemetrySyncHandler.DEVICE_REGISTER_ENDPOINT + '/' + this.deviceInfo!.getDeviceID())
                .withApiToken(true)
                .withBody({
                    request: {
                        dspec: deviceSpec,
                        channel: activeChannelId,
                        fcmToken: this.telemetryConfig.fcmToken,
                        producer: this.apiConfig.api_authentication.producerId,
                        first_access: parseInt(firstAccessTimestamp)
                    }
                })
                .build();

            return this.apiService!.fetch<DeviceRegisterResponse>(apiRequest)
                .do(async (res) => {
                    const actions = res.body['result'].actions;
                    actions.forEach(element => {
                        if (element.type === 'experiment' && element.key) {
                            this.sharedPreferences.putString(CodePush.DEPLOYMENT_KEY,
                                element.data.key).toPromise();
                        }
                    });
                    const serverTime = new Date(res.body.ts).getTime();
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
                })
                .mergeMap(() => {
                    return Observable.zip(
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY,
                            Date.now() + ''),
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY,
                            'true')
                    ).mapTo(undefined);
                })
                .catch((e) => {
                    return Observable.zip(
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY,
                            Date.now() + ''),
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY,
                            'false')
                    ).mergeMap(() => {
                        console.error(e);
                        return Observable.throw(new Error('Device Registration Failed'));
                    });
                });
        });
    }

    public processEventsBatch(): Observable<number> {
        return this.fetchEvents()
            .mergeMap((events) =>
                this.processEvents(events)
                    .mergeMap((processedEventsMeta) =>
                        this.persistProcessedEvents(processedEventsMeta, processedEventsMeta.processedEventsSize)
                            .mergeMap(() => this.deleteEvents(events))
                            .mapTo(events.length)
                    )
            );
    }

    private hasTelemetryThresholdCrossed(): Observable<boolean> {
        return this.dbService.execute(`
            SELECT count(*) as COUNT FROM ${TelemetryEntry.TABLE_NAME}`
        ).map((result) => {
            if (result && result[0] && (result[0]['COUNT'] >= this.telemetryConfig.telemetrySyncThreshold)) {
                return true;
            } else {
                return false;
            }
        });
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
            return Observable.of({
                processedEventsSize: 0
            });
        }

        const messageId = UniqueId.generateUniqueId();
        return Observable.of({
            processedEvents: this.preprocessors.reduce((acc, current) => {
                return current.process(acc);
            }, {
                id: 'ekstep.telemetry',
                ver: '1.0',
                ts: moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss[Z]'),
                events: events.map((e) => JSON.parse(e[COLUMN_NAME_EVENT])),
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
            return Observable.of(undefined);
        }

        const insertQuery: InsertQuery = {
            table: TelemetryProcessedEntry.TABLE_NAME,
            modelJson: {
                [COLUMN_NAME_MSG_ID]: messageId,
                [COLUMN_NAME_NUMBER_OF_EVENTS]: eventsCount,
                [COLUMN_NAME_PRIORITY]: 1,
                [COLUMN_NAME_DATA]: processedEvents
            }
        };

        return this.dbService.insert(insertQuery)
            .mapTo(undefined);
    }

    private deleteEvents(events: TelemetryEntry.SchemaMap[]): Observable<undefined> {
        if (!events.length) {
            return Observable.of(undefined);
        }

        return this.dbService.execute(`
            DELETE FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry._ID} IN (${events.map((event) => event[TelemetryEntry._ID]).join(',')})
        `);
    }

    private handleProcessedEventsBatch(): Observable<TelemetrySyncStat> {
        return this.fetchProcessedEventsBatch()
            .mergeMap(processedEventsBatchEntry =>
                this.syncProcessedEvent(processedEventsBatchEntry)
                    .mergeMap((syncStat?: TelemetrySyncStat) =>
                        this.deleteProcessedEvent(processedEventsBatchEntry)
                            .mapTo(syncStat || {
                                syncedEventCount: 0,
                                syncTime: Date.now(),
                                syncedFileSize: 0
                            })
                    )
                    .catch(() => {
                        return Observable.of({
                            syncedEventCount: 0,
                            syncTime: Date.now(),
                            syncedFileSize: 0
                        });
                    })
            );
    }

    private fetchProcessedEventsBatch(): Observable<TelemetryProcessedEntry.SchemaMap | undefined> {
        return this.dbService.read({
            table: TelemetryProcessedEntry.TABLE_NAME,
            selection: '',
            selectionArgs: [],
            limit: '1'
        }).map((r: TelemetryProcessedEntry.SchemaMap[]) => r && r[0]);
    }

    private syncProcessedEvent(processedEventsBatchEntry?: TelemetryProcessedEntry.SchemaMap): Observable<TelemetrySyncStat | undefined> {
        if (!processedEventsBatchEntry) {
            return Observable.of(undefined);
        }

        const gzippedCharData = processedEventsBatchEntry[COLUMN_NAME_DATA].split('').map((c) => {
            return c.charCodeAt(0);
        });
        const body = new Uint8Array(gzippedCharData);

        // const body = JSON.parse(pako.ungzip(processedEventsBatchEntry[COLUMN_NAME_DATA], {to: 'string'}));

        const apiRequest: Request = new Request.Builder()
            .withHost(this.telemetryConfig.host!)
            .withType(HttpRequestType.POST)
            .withPath(this.telemetryConfig.telemetryApiPath +
                TelemetrySyncHandler.TELEMETRY_ENDPOINT)
            .withBody(body)
            .withApiToken(true)
            .build();

        return this.apiService!.fetch(apiRequest)
            .do(async (res) => {
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
            })
            .map(() => ({
                syncedEventCount: processedEventsBatchEntry[COLUMN_NAME_NUMBER_OF_EVENTS],
                syncTime: Date.now(),
                syncedFileSize: new TextEncoder().encode(processedEventsBatchEntry[COLUMN_NAME_DATA]).length
            }));
    }

    private deleteProcessedEvent(processedEventsBatchEntry?: TelemetryProcessedEntry.SchemaMap): Observable<undefined> {
        if (!processedEventsBatchEntry) {
            return Observable.of(undefined);
        }

        return this.dbService.delete({
            table: TelemetryProcessedEntry.TABLE_NAME,
            selection: `_id = ?`,
            selectionArgs: [processedEventsBatchEntry[TelemetryProcessedEntry._ID]]
        });
    }
}
