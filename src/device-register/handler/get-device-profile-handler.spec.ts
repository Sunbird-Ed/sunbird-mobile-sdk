import { GetDeviceProfileHandler } from './get-device-profile-handler';
import { SdkConfig, DeviceInfo, ApiService } from '../..';
import { mockSdkConfigWithSampleApiConfig } from './device-register-handler.spec.data';
import { of } from 'rxjs';

describe('GetDeviceProfileHandler', () => {
    let getDeviceProfileHandler: GetDeviceProfileHandler;

    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        getDeviceProfileHandler = new GetDeviceProfileHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockApiService as ApiService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of getDeviceProfileHandler', () => {
        expect(getDeviceProfileHandler).toBeTruthy();
    });

    it('should handle to get device profile details', (done) => {
        // arrange
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => { });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));
        mockApiService.fetch = jest.fn().mockImplementation(() => { });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
            body: {
                userDeclaredLocation: {
                    state: 'AP',
                    district: 'dis'
                },
                ipLocation: {
                    state: 'ODISHA',
                    district: 'dis'
                }
            }
        }
        ));
        // act
        getDeviceProfileHandler.handle().subscribe(() => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });
});
