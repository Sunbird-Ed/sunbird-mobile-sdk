import {TelemetrySyncHandler} from './telemetry-sync-handler';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {AppInfo} from '../../util/app';
import {DeviceRegisterService} from '../../device-register';
import {KeyValueStore} from '../../key-value-store';
import {ApiService, HttpClientError, Response, ResponseCode} from '../../api';
import {throwError} from 'rxjs';
import {TelemetryProcessedEntry} from '../db/schema';

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

    describe('syncProcessedEvent()', () => {
        it('should resolve with 0 sync events if corrupt data sync is attempted', () => {
            // arrange
            // act
            // assert
        });
    });
});
