import {ApiConfig, ApiRequestHandler, ApiService} from '../../api';
import {InteractSubType, InteractType, TelemetryAutoSyncModes, TelemetrySyncRequest, TelemetrySyncStat} from '..';
import {TelemetrySyncPreprocessor} from '../def/telemetry-sync-preprocessor';
import {StringToGzippedString} from '../impl/string-to-gzipped-string';
import {TelemetryEntriesToStringPreprocessor} from '../impl/telemetry-entries-to-string-preprocessor';
import {KeyValueStore} from '../../key-value-store';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {DbService} from '../../db';
import {TelemetryEntry} from '../db/schema';
import {UniqueId} from '../../db/util/unique-id';
import dayjs from 'dayjs';
import {TelemetryLogger} from '../util/telemetry-logger';
import {TelemetryConfig} from '../config/telemetry-config';
import {SharedPreferences} from '../../util/shared-preferences';
import {CodePush, TelemetryKeys} from '../../preference-keys';
import {AppInfo} from '../../util/app';
import {DeviceRegisterService} from '../../device-register';
import {defer, Observable, of, zip} from 'rxjs';
import {catchError, map, mapTo, mergeMap, tap} from 'rxjs/operators';
import {NetworkQueue, NetworkQueueType} from '../../api/network-queue';
import {NetworkRequestHandler} from '../../api/network-queue/handlers/network-request-handler';

interface ProcessedEventsMeta {
  processedEvents?: string;
  processedEventsSize: number;
  messageId?: string;
}

export class TelemetrySyncHandler implements ApiRequestHandler<TelemetrySyncRequest, TelemetrySyncStat> {

  public static readonly TELEMETRY_LOG_MIN_ALLOWED_OFFSET_KEY = 'telemetry_log_min_allowed_offset_key';

  private static readonly LAST_SYNCED_DEVICE_REGISTER_ATTEMPT_TIME_STAMP_KEY = 'last_synced_device_register_attempt_time_stamp';
  private static readonly LAST_SYNCED_DEVICE_REGISTER_IS_SUCCESSFUL_KEY = 'last_synced_device_register_is_successful';
  public static readonly TELEMETRY_ENDPOINT = '/telemetry';
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
    private apiService?: ApiService,
    private networkQueue?: NetworkQueue
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

  handle({ignoreSyncThreshold, ignoreAutoSyncMode}: TelemetrySyncRequest): Observable<TelemetrySyncStat> {
    const isForceSynced: boolean = !!(ignoreSyncThreshold && ignoreAutoSyncMode);
    return this.registerDevice().pipe(
      catchError(() => {
        ignoreSyncThreshold = true;
        return of(undefined);
      }),
      mergeMap(() => {
        return this.hasTelemetryThresholdCrossed().pipe(
          mergeMap((hasTelemetryThresholdCrossed: boolean) => {
            if (!hasTelemetryThresholdCrossed && !ignoreSyncThreshold) {
              return of({
                syncedEventCount: 0,
                syncTime: Date.now(),
                syncedFileSize: 0
              });
            }
            return defer(async () => {
              const mode = await this.sharedPreferences.getString(TelemetryKeys.KEY_AUTO_SYNC_MODE).toPromise();
              switch (mode) {
                case TelemetryAutoSyncModes.OFF:
                  return {
                    syncedEventCount: 0,
                    syncTime: Date.now(),
                    syncedFileSize: 0,
                    error: new Error('AUTO_SYNC_MODE: ' + TelemetryAutoSyncModes.OFF)
                  };
                case TelemetryAutoSyncModes.OVER_WIFI:
                  let connectionType;
                  window['Capacitor']['Plugins'].Network.getStatus().then(status => connectionType = status.connectionType)
                  if (connectionType !== 'wifi') {
                    return {
                      syncedEventCount: 0,
                      syncTime: Date.now(),
                      syncedFileSize: 0,
                      error: new Error('AUTO_SYNC_MODE: ' + TelemetryAutoSyncModes.OVER_WIFI)
                    };
                  }
                  break;
                case TelemetryAutoSyncModes.ALWAYS_ON:
                  break;
                default:
                  break;
              }
              let currentSyncStat: TelemetrySyncStat = {
                syncedEventCount: 0,
                syncTime: Date.now(),
                syncedFileSize: 0
              };
              let eventCount;
              do {
                try {
                  eventCount = await this.processEventsBatch(isForceSynced).toPromise();
                  currentSyncStat = {
                    syncedEventCount: currentSyncStat.syncedEventCount + eventCount,
                    syncTime: Date.now(),
                    syncedFileSize: 0
                  };
                } catch (e) {
                  currentSyncStat = {
                    syncedEventCount: currentSyncStat.syncedEventCount,
                    syncTime: Date.now(),
                    syncedFileSize: 0,
                    error: e
                  };
                }
              } while (eventCount && !currentSyncStat.error);
              return currentSyncStat;
            });
          })
        );
      })
    );
  }

  public processEventsBatch(isForceSynced: boolean): Observable<number> {
    return this.fetchEvents().pipe(
      mergeMap((events) =>
        this.processEvents(events).pipe(
          mergeMap((processedEventsMeta) =>
            this.persistinNetworkQueue(processedEventsMeta, processedEventsMeta.processedEventsSize, isForceSynced).pipe(
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
            for(const element of actions) {
              if (element.type === 'experiment' && element.key) {
                await this.sharedPreferences.putString(CodePush.DEPLOYMENT_KEY,
                  element.data.key).toPromise();
              }
            };
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

  private persistinNetworkQueue({processedEvents, messageId}: ProcessedEventsMeta,
                                eventsCount: number, isForceSynced: boolean): Observable<undefined> {
    if (!processedEvents) {
      return of(undefined);
    }

    return this.networkQueue!.enqueue(new NetworkRequestHandler(this.sdkConfig).generateNetworkQueueRequest(
      NetworkQueueType.TELEMETRY, processedEvents, messageId, eventsCount, isForceSynced), true).pipe(
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
}
