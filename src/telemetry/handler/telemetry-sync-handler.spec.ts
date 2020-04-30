import {TelemetrySyncHandler} from './telemetry-sync-handler';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {AppInfo} from '../../util/app';
import {DeviceRegisterService} from '../../device-register';
import {KeyValueStore} from '../../key-value-store';
import {ApiService} from '../../api';
import {of} from 'rxjs';
import {TelemetryEntry} from '../db/schema';
import {TelemetryKeys} from '../../preference-keys';
import {TelemetryAutoSyncModes} from '..';

describe('TelemetrySyncHandler', () => {
  let telemetrySyncHandler: TelemetrySyncHandler;

  const mockDbService: Partial<DbService> = {};
  const mockSdkConfig: Partial<SdkConfig> = {
    telemetryConfig: {
      apiPath: 'some/path',
      telemetrySyncBandwidth: 10,
      telemetrySyncThreshold: 200,
      telemetryLogMinAllowedOffset: 100
    }
  };
  const mockDeviceInfo: Partial<DeviceInfo> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAppInfo: Partial<AppInfo> = {};
  const mockDeviceRegister: Partial<DeviceRegisterService> = {};
  const mockKeyValueStore: Partial<KeyValueStore> = {};
  const mockApiService: Partial<ApiService> = {};

  beforeAll(() => {
    telemetrySyncHandler = new TelemetrySyncHandler(
      mockDbService as DbService,
      mockSdkConfig as SdkConfig,
      mockDeviceInfo as DeviceInfo,
      mockSharedPreferences as SharedPreferences,
      mockAppInfo as AppInfo,
      mockDeviceRegister as DeviceRegisterService,
      mockKeyValueStore as KeyValueStore,
      mockApiService as ApiService
    );
  });

  describe('handle()', () => {
    it('should resolve with 0 sync events if corrupt data sync is attempted', () => {
      // arrange
      mockKeyValueStore.getValue = jest.fn((key) => {
        let output;
        switch (key) {
          case 'last_synced_device_register_attempt_time_stamp':
            output = 123;
            break;
          case 'last_synced_device_register_is_successful':
            output = false;
            break;
        }
        return of(output);
      });

      mockDbService.execute = jest.fn().mockImplementation((query) => {
        let output;
        if (query.toString().trim() === `SELECT count(*) as COUNT FROM ${TelemetryEntry.TABLE_NAME}`) {
          output = [{COUNT: 250}];
        } else if (query.toString().trim() === `SELECT * FROM ${TelemetryEntry.TABLE_NAME}
            WHERE ${TelemetryEntry.COLUMN_NAME_PRIORITY} = (SELECT MIN (${TelemetryEntry.COLUMN_NAME_PRIORITY})
            FROM ${TelemetryEntry.TABLE_NAME})
            ORDER BY ${TelemetryEntry.COLUMN_NAME_TIMESTAMP}
            LIMIT ${mockSdkConfig.telemetryConfig!.telemetrySyncBandwidth}`.trim()) {
          console.log('Inside query', 'Inside query');
          output = [{
            _id: 1,
            event_type: '',
            event: '{\\"ver\\":\\"3.0\\",\\"eid\\":\\"INTERACT\\",\\"ets\\":1587040888823,\\"actor\\":{\\"type\\":\\"User\\",\\"id\\":\\"e425139f-77e5-4518-8917-9aac64bf1df7\\"},\\"context\\":{\\"sid\\":\\"91f07b3c-9f03-4e8b-96d7-705d57660df0\\",\\"did\\":\\"13e9e8e7b514112b9501c279b124561693aad8eb\\"},\\"edata\\":{\\"pageid\\":\\"library\\",\\"extra\\":{\\"pos\\":[]}},\\"object\\":{\\"id\\":\\"\\",\\"type\\":\\"\\",\\"version\\":\\"\\",\\"rollup\\":{}},\\"mid\\":\\"09554d40-a8c7-434c-80d7-5e3832ab3a7e\\"}',
            timestamp: 1,
            priority: 1
          }];
        }
        return of(output);
      });

      mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
        let output;
        if (key === TelemetryKeys.KEY_AUTO_SYNC_MODE) {
          output = TelemetryAutoSyncModes.ALWAYS_ON;
        }
        return of(output);
      });
      // act & assert
      telemetrySyncHandler.handle({ignoreSyncThreshold: true, ignoreAutoSyncMode: true}).subscribe(() => {

      });
    });
  });
});
