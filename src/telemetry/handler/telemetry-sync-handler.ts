import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TelemetryEvents, TelemetrySyncStat} from '..';
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
import * as pako from 'pako';
import Telemetry = TelemetryEvents.Telemetry;
import COLUMN_NAME_MSG_ID = TelemetryProcessedEntry.COLUMN_NAME_MSG_ID;
import COLUMN_NAME_NUMBER_OF_EVENTS = TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS;
import COLUMN_NAME_PRIORITY = TelemetryEntry.COLUMN_NAME_PRIORITY;
import COLUMN_NAME_DATA = TelemetryProcessedEntry.COLUMN_NAME_DATA;

export class TelemetrySyncHandler implements ApiRequestHandler<undefined, TelemetrySyncStat> {
    private static readonly LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY = 'last_synced_device_register_time_stamp';
    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';
    private static readonly TELEMETRY_ENDPOINT = '/telemetry';
    private static readonly REGISTER_API_SUCCESS_TTL = 24 * 60 * 60 * 1000;
    private static readonly REGISTER_API_FAILURE_TTL = 60 * 60 * 1000;

    private readonly preprocessors: TelemetrySyncPreprocessor[];

    constructor(private keyValueStore: KeyValueStore,
                private dbService: DbService,
                private apiService: ApiService,
                private telemetryConfig: TelemetryConfig,
                private deviceInfo: DeviceInfo) {
        this.preprocessors = [
            new TelemetryEntriesToStringPreprocessor(),
            new StringToByteArrayPreprocessor(),
            new ByteArrayToBinaryStringPreprocessor()
        ];
    }

    handle(): Observable<TelemetrySyncStat> {
        return this.keyValueStore.getValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY)
            .mergeMap((timestamp: string | undefined) => {
                if (timestamp && (parseInt(timestamp, 10) > Date.now())) {
                    return Observable.of(undefined);
                }

                return this.registerDevice();
            })
            .mergeMap(() => {
                return this.fetchEvents()
                    .takeWhile((events) => !!events.length);
            })
            .mergeMap((events: Telemetry[]) => {
                return this.processEvents(events)
                    .mergeMap((processedEventsMeta) => {
                        return this.persistProcessedEvents(processedEventsMeta, events.length)
                            .mergeMap(() => {
                                return this.syncProcessedEvents(processedEventsMeta.processedEvents);
                            })
                            .map(() => {
                                return {
                                    syncedEventCount: events.length,
                                    syncTime: Date.now(),
                                    syncedFileSize: events.length / 1024 + 'Kb'
                                };
                            });
                    });
            });
    }

    private registerDevice(): Observable<undefined> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.telemetryConfig.deviceRegisterApiPath +
                TelemetrySyncHandler.DEVICE_REGISTER_ENDPOINT + '/' + this.deviceInfo.getDeviceID())
            .withApiToken(true)
            .build();

        return this.apiService.fetch(apiRequest)
            .mergeMap(() =>
                this.keyValueStore.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY,
                    Date.now() + TelemetrySyncHandler.REGISTER_API_SUCCESS_TTL + '')
                    .map(() => undefined)
            )
            .catch(() =>
                this.keyValueStore.setValue(TelemetrySyncHandler.LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY,
                    Date.now() + TelemetrySyncHandler.REGISTER_API_FAILURE_TTL + '')
                    .map(() => undefined)
            );
    }

    private fetchEvents(): Observable<Telemetry[]> {
        const events$ = this.dbService.execute(`
            SELECT * FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry.COLUMN_NAME_PRIORITY} = (SELECT MIN (${TelemetryEntry.COLUMN_NAME_PRIORITY})
            FROM ${TelemetryEntry.TABLE_NAME})
            ORDER BY ${TelemetryEntry.COLUMN_NAME_TIMESTAMP}
            LIMIT 1000`
        );

        return events$.expand(() => events$);
    }

    private processEvents(events: Telemetry[]): Observable<{ processedEvents: string, messageId: string }> {
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
            messageId
        });
    }

    private persistProcessedEvents({processedEvents, messageId}, eventsCount: number): Observable<undefined> {
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
            .map(() => undefined);
    }

    private syncProcessedEvents(processedEvents: string): Observable<undefined> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.telemetryConfig.telemetryApiPath +
                TelemetrySyncHandler.TELEMETRY_ENDPOINT)
            .withBody(JSON.parse(pako.inflate(processedEvents, {to: 'string'})))
            .withApiToken(true)
            .build();

        return this.apiService.fetch(apiRequest)
            .map(() => undefined);
    }
}
