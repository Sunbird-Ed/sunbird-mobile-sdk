import { ApiTokenHandler } from './api-token-handler';
import { ApiConfig, ApiService } from '..';
import { DeviceInfo, JWTUtil, ResponseCode } from '../..';
import { of, throwError } from 'rxjs';

describe('ApiTokenHandler', () => {
    let apiTokenHandler: ApiTokenHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockConfig: Partial<ApiConfig> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};

    beforeAll(() => {
        apiTokenHandler = new ApiTokenHandler(
            mockConfig as ApiConfig,
            mockApiService as ApiService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be instance of apiTokenHandler', () => {
        expect(apiTokenHandler).toBeTruthy();
    });

    describe('refreshAuthToken', () => {
        it('should return MobileDeviceConsumerSecretAPIRequest', (done) => {
            // arrange
            mockApiService.fetch = jest.fn(() => of({
                body: {
                    result: {
                        secret: 'sample-secret-key'
                    }
                }
            })) as any;
            mockConfig.api_authentication = { mobileAppConsumer: 'sample-mobile-app-consumer' } as any;
            jest.spyOn(JWTUtil, 'createJWToken').mockReturnValue('sample');
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
            // act
            apiTokenHandler.refreshAuthToken().subscribe(() => {
                // asert
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(mockConfig.api_authentication).toBeTruthy();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                done();
            });
        });
    });
});
