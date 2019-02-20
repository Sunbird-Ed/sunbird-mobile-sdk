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
import {DbService} from '../../db';
import {TelemetryEntry} from '../db/schema';
import Telemetry = TelemetryEvents.Telemetry;

export class TelemetrySyncHandler implements ApiRequestHandler<undefined, TelemetrySyncStat> {
    private static readonly LAST_SYNCED_DEVICE_REGISTER_TIME_STAMP_KEY = 'last_synced_device_register_time_stamp';
    private static readonly DEVICE_REGISTER_ENDPOINT = '/register';
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
                return this.fetchEvents();
            })
            .mergeMap((events: Telemetry[]) => {
                return this.processEvents(events);
            })
            .mergeMap((processedEvents: string) => {
                return this.persistProcessedEvents(processedEvents)
                    .mergeMap(() => {
                        return this.syncProcessedEvents(processedEvents);
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
        return this.dbService.execute(`
            SELECT * FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry.COLUMN_NAME_PRIORITY} = (SELECT MIN (${TelemetryEntry.COLUMN_NAME_PRIORITY})
            FROM ${TelemetryEntry.TABLE_NAME})
            ORDER BY ${TelemetryEntry.COLUMN_NAME_TIMESTAMP}
            LIMIT 1000`
        );
    }

    private processEvents(events: Telemetry[]): Observable<string> {
        return Observable.of(this.preprocessors.reduce((acc, current) => {
            return current.process(acc);
        }, events));
    }

    private persistProcessedEvents(processedEvents: string): Observable<undefined> {
        // TODO
        throw new Error('Method to be implemented');
    }

    private syncProcessedEvents(processedEvents: string): Observable<TelemetrySyncStat> {
        // TODO
        throw new Error('Method to be implemented');
    }
}
