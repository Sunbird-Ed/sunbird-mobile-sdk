import {DeviceRegisterHandler} from './device-register-handler';
import {ApiService, AppInfo, DeviceInfo, DeviceRegisterRequest, FrameworkService, SdkConfig, SharedPreferences} from '../..';
import {Observable} from 'rxjs';
import {mockSdkConfigWithSampleApiConfig} from './device-register-handler.spec.data';

describe('DeviceRegisterHandler', () => {
    let deviceRegisterHandler: DeviceRegisterHandler;

    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        deviceRegisterHandler = new DeviceRegisterHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockAppInfo as AppInfo,
            mockApiService as ApiService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of deviceRegisterHandler', () => {
        expect(deviceRegisterHandler).toBeTruthy();
    });

    it('should handle register device spec and first access time stamps', (done) => {
        // arrange
        const request: DeviceRegisterRequest = {
            fcmToken: 'SAMPLE_FCM_TOKEN'
        };
        mockDeviceInfo.getDeviceSpec = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(Observable.of({}));

        mockFrameworkService.getActiveChannelId = jest.fn(() => {
        });
        (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(Observable.of(''));

        mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
        });
        (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(Observable.of(''));

        mockDeviceInfo.getDeviceID = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(Observable.of('SAMPLE_DEVICE_ID'));

        mockSharedPreferences.getString = jest.fn(() => {
        });
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of('{"state":"STATE","district":"DISTRICT"}'));

        mockApiService.fetch = jest.fn(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(Observable.of({}));

        // act
        deviceRegisterHandler.handle(request).subscribe(() => {
            // assert
            // expect().toHaveBeenCalled();
            done();
        });
    });

    it('should handle register device spec and first access time stamps if DeviceRegisterRequest is not available', (done) => {
        // arrange
        mockDeviceInfo.getDeviceSpec = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(Observable.of({}));

        mockFrameworkService.getActiveChannelId = jest.fn(() => {
        });
        (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(Observable.of(''));

        mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
        });
        (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(Observable.of(''));

        mockDeviceInfo.getDeviceID = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(Observable.of('SAMPLE_DEVICE_ID'));

        mockSharedPreferences.getString = jest.fn(() => {
        });
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of('{"state":"STATE","district":"DISTRICT"}'));

        mockApiService.fetch = jest.fn(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(Observable.of({}));

        // act
        deviceRegisterHandler.handle().subscribe(() => {
            // assert
            // expect().toHaveBeenCalled();
            done();
        });
    });

});
