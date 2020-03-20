import { Container, inject } from 'inversify';
import { DeviceRegisterServiceImpl, DeviceRegisterService } from '..';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig, DeviceInfo, FrameworkService, AppInfo, ApiService, SharedPreferences } from '../..';
import { DeviceRegisterHandler } from '../handler/device-register-handler';
import { GetDeviceProfileHandler } from '../handler/get-device-profile-handler';
import { of } from 'rxjs';

jest.mock('../handler/device-register-handler');
jest.mock('../handler/get-device-profile-handler');

describe('DeviceRegisterServiceImpl', () => {
    let deviceRegisterServiceImpl: DeviceRegisterServiceImpl;
    const container: Container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        container.bind<DeviceRegisterService>(InjectionTokens.DEVICE_REGISTER_SERVICE).to(DeviceRegisterServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).toConstantValue(mockFrameworkService as FrameworkService);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);

        deviceRegisterServiceImpl = container.get(InjectionTokens.DEVICE_REGISTER_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (DeviceRegisterHandler as any as jest.Mock<DeviceRegisterHandler>).mockClear();
        (GetDeviceProfileHandler as any as jest.Mock<GetDeviceProfileHandler>).mockClear();
    });

    it('should be create a instance of deviceRegisterServiceImpl', () => {
        expect(deviceRegisterServiceImpl).toBeTruthy();
    });

    it('should decoupled device register Api for telemetry sync by invoked registerDevice()', (done) => {
        // arrange
        const handleResponse = jest.fn().mockImplementation(() => of(''));
        (DeviceRegisterHandler as any as jest.Mock<DeviceRegisterHandler>).mockImplementation(() => {
            return {
                handle: handleResponse,
            } as Partial<DeviceRegisterHandler> as DeviceRegisterHandler;
        });
        deviceRegisterServiceImpl = container.get(InjectionTokens.DEVICE_REGISTER_SERVICE);
        // act
        deviceRegisterServiceImpl.registerDevice().subscribe(() => {
            expect(handleResponse).toBeCalled();
            done();
        });
    });

    it('should get device profile by invoked getDeviceProfile()', (done) => {
        // arrange
        const profileHandlerData = jest.fn().mockImplementation(() => of(''));
        (GetDeviceProfileHandler as any as jest.Mock<GetDeviceProfileHandler>).mockImplementation(() => {
            return {
                handle: profileHandlerData,
            } as Partial<GetDeviceProfileHandler> as GetDeviceProfileHandler;
        });
        deviceRegisterServiceImpl = container.get(InjectionTokens.DEVICE_REGISTER_SERVICE);
        // act
        deviceRegisterServiceImpl.getDeviceProfile().subscribe(() => {
            expect(profileHandlerData).toHaveBeenCalled();
            done();
        });
    });
});
