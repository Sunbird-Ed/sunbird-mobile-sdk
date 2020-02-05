import {ErrorLoggerService} from '../index';
import {Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {ErrorLoggerServiceImpl} from './error-logger-service-impl';
import {SystemSettings, SystemSettingsService} from '../../system-settings';
import {DbService} from '../../db';
import {AppInfo} from '../../util/app';
import {ApiService} from '../../api';
import {SdkConfig} from '../../sdk-config';
import {NetworkInfoService} from '../../util/network';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {mockSdkConfigWithErrorLoggerConfig} from './error-logger-service-impl.spec.data';
import {Observable} from 'rxjs';
import {TelemetryErrorRequest} from '../../telemetry';
import {ErrorStack} from '../def/error-stack';
import {ErrorStackSyncHandler} from '../handlers/error-stack-sync-handler';
import { of } from 'rxjs';

jest.mock('../handlers/error-stack-sync-handler');

describe('ErrorLoggerServiceImpl', () => {
    let errorLoggerService: ErrorLoggerService;

    const container = new Container();

    const mockSystemSettingsService: Partial<SystemSettingsService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockNetworkInfoService: Partial<NetworkInfoService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        container.bind<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE).to(ErrorLoggerServiceImpl);
        container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).toConstantValue
        (mockSystemSettingsService as SystemSettingsService);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithErrorLoggerConfig as SdkConfig);
        container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).toConstantValue
        (mockNetworkInfoService as NetworkInfoService);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);

        errorLoggerService = container.get<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (ErrorStackSyncHandler as jest.Mock<ErrorStackSyncHandler>).mockClear();
    });

    it('should return instance from the container', () => {
        expect(errorLoggerService).toBeTruthy();
    });

    it('should fetch currentTime from sharedPreferences', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(Date.now() + ''));
        // act
        errorLoggerService.onInit().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith('error_log_last_synced_time_stamp');
            done();
        });
    });

    it('should store currentTime if not available', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

        // act
        errorLoggerService.onInit().subscribe(() => {
            // assert
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith('error_log_last_synced_time_stamp',
                expect.any(String));
            done();
        });
    });
    it('should logError and push it into DB', (done) => {
        // arrange
        const telemetryRequest: TelemetryErrorRequest = {
            errorCode: 'sample_error_code',
            errorType: 'sample_errorType',
            stacktrace: 'sample_stackTrace',
            pageId: 'sample_pageId'
        };
        const request: ErrorStack = {
            appver: 'current_version_name',
            pageid: telemetryRequest.pageId,
            ts: Date.now(),
            log: telemetryRequest.stacktrace
        };
        mockAppInfo.getVersionName = jest.fn().mockImplementation(() => 'sample_app_version');
        (mockDbService.insert) = jest.fn().mockImplementation(() => of(undefined));
        mockDbService.execute = jest.fn().mockImplementation(() => of([1]));
        mockSystemSettingsService.getSystemSettings = jest.fn().mockImplementation(() => of<SystemSettings>({
            id: 'errorLogSyncSettings',
            field: 'sample_field',
            value: JSON.stringify({frequency: 1, bandWidth: 2})
        }));
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('error_log_last_synced_time_stamp'));
        // act
        errorLoggerService.logError(telemetryRequest).subscribe(() => {
            // assert
            expect(mockAppInfo.getVersionName).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalledWith(
                expect.objectContaining({id: 'errorLogSyncSettings'})
            );
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith('error_log_last_synced_time_stamp');
            done();
        });
    });
});
