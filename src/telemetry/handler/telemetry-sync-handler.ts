import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TelemetrySyncStat} from '..';
import {Observable} from 'rxjs';
import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {StringToByteArrayPreprocessor} from '../impl/string-to-byte-array-preprocessor';
import {ByteArrayToBinaryStringPreprocessor} from '../impl/byte-array-to-binary-string-preprocessor';
import {TelemetryEntriesToStringPreprocessor} from '../impl/telemetry-entries-to-string-preprocessor';
import {KeyValueStore} from '../../key-value-store';
import {TelemetryConfig} from '../config/telemetry-config';
import {DeviceInfo} from '../../util/device/def/device-info';
import {DbService, InsertQuery} from '../../db';
import {TelemetryEntry, TelemetryProcessedEntry} from '../db/schema';
import {UniqueId} from '../../db/util/unique-id';
import COLUMN_NAME_MSG_ID = TelemetryProcessedEntry.COLUMN_NAME_MSG_ID;
import COLUMN_NAME_NUMBER_OF_EVENTS = TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS;
import COLUMN_NAME_PRIORITY = TelemetryEntry.COLUMN_NAME_PRIORITY;
import COLUMN_NAME_DATA = TelemetryProcessedEntry.COLUMN_NAME_DATA;

interface ProcessedEventsMeta {
    processedEvents?: string;
    processedEventsSize: number;
    messageId?: string;
}

export class TelemetrySyncHandler implements ApiRequestHandler<undefined, TelemetrySyncStat> {
    private static readonly LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY = 'last_synced_device_register_time_stamp';
    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';
    private static readonly TELEMETRY_ENDPOINT = '/telemetry';
    private static readonly REGISTER_API_SUCCESS_TTL = 24 * 60 * 60 * 1000;
    private static readonly REGISTER_API_FAILURE_TTL = 60 * 60 * 1000;

    private readonly preprocessors: TelemetrySyncPreprocessor[];

    constructor(private dbService: DbService,
                private telemetryConfig: TelemetryConfig,
                private deviceInfo: DeviceInfo,
                private keyValueStore?: KeyValueStore,
                private apiService?: ApiService) {
        this.preprocessors = [
            new TelemetryEntriesToStringPreprocessor(),
            new StringToByteArrayPreprocessor(),
            new ByteArrayToBinaryStringPreprocessor()
        ];
    }

    handle(): Observable<TelemetrySyncStat> {
        return this.registerDevice()
            .mergeMap(() => this.processEventsBatch())
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

    private registerDevice(): Observable<undefined> {
        return this.keyValueStore!.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY)
            .mergeMap((timestamp: string | undefined) => {
                if (timestamp && (parseInt(timestamp, 10) > Date.now())) {
                    return Observable.of(undefined);
                }

                const apiRequest: Request = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withHost(this.telemetryConfig!.deviceRegisterHost)
                    .withPath(this.telemetryConfig!.deviceRegisterApiPath +
                        TelemetrySyncHandler.DEVICE_REGISTER_ENDPOINT + '/' + this.deviceInfo!.getDeviceID())
                    .withApiToken(true)
                    .build();

                return this.apiService!.fetch(apiRequest)
                    .mergeMap(() =>
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY,
                            Date.now() + TelemetrySyncHandler.REGISTER_API_SUCCESS_TTL + '')
                            .map(() => undefined)
                    )
                    .catch(() =>
                        this.keyValueStore!.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY,
                            Date.now() + TelemetrySyncHandler.REGISTER_API_FAILURE_TTL + '')
                            .map(() => undefined)
                    );
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

    private fetchEvents(): Observable<TelemetryEntry.SchemaMap[]> {
        return this.dbService.execute(`
            SELECT count(*) as COUNT FROM ${TelemetryEntry.TABLE_NAME}`
        ).mergeMap((result) => {
            if (result && result[0] && (result[0]['COUNT'] >= this.telemetryConfig.telemetrySyncThreshold)) {
                return this.dbService.execute(`
                    SELECT * FROM ${TelemetryEntry.TABLE_NAME}
                    WHERE ${TelemetryEntry.COLUMN_NAME_PRIORITY} = (SELECT MIN (${TelemetryEntry.COLUMN_NAME_PRIORITY})
                    FROM ${TelemetryEntry.TABLE_NAME})
                    ORDER BY ${TelemetryEntry.COLUMN_NAME_TIMESTAMP}
                    LIMIT ${this.telemetryConfig.telemetrySyncBandwidth}`
                );
            }

            return Observable.of([]);
        });
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
                ts: Date.now(),
                data: events,
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

        const body = new TextEncoder().encode(processedEventsBatchEntry[COLUMN_NAME_DATA]);
        // const body = JSON.parse(pako.ungzip(processedEventsBatchEntry[COLUMN_NAME_DATA], {to: 'string'}));

        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withHeaders({'Content-Encoding': 'gzip'})
            .withPath(this.telemetryConfig.telemetryApiPath +
                TelemetrySyncHandler.TELEMETRY_ENDPOINT)
            .withBody(body)
            .withApiToken(true)
            .build();

        return this.apiService!.fetch(apiRequest)
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
