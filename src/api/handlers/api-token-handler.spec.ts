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

    describe('refreshAuthTokenV2', () => {
        it('should return BearerTokenFromKongV2', (done) => {
            mockConfig.api_authentication = {
                mobileAppConsumer: 'sample-mobile-app-consumar',
                mobileAppKey: 'sample-mobile-app-key',
                mobileAppSecret: 'sample-mobileAppSecret'
            } as any;
            mockApiService.fetch = jest.fn(() => of({
                body: {
                    result: {
                        token: 'sample-mobile-token'
                    }
                }
            })) as any;
            // act
            apiTokenHandler.refreshAuthTokenV2().subscribe(() => {
                expect(mockConfig.api_authentication).not.toBeUndefined();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            });
        });

        it('should return BearerTokenFromKongV2 for catch part 447', (done) => {
            mockConfig.api_authentication = {
                mobileAppConsumer: 'sample-mobile-app-consumar',
                mobileAppKey: 'sample-mobile-app-key',
                mobileAppSecret: 'sample-mobileAppSecret'
            } as any;
            mockApiService.fetch = jest.fn(() => throwError({
                response: {
                    responseCode: ResponseCode.HTTP_KONG_FAILURE,
                    headers: {
                        location: 'sample-area'
                    }
                }
            })) as any;
            // act
            apiTokenHandler.refreshAuthTokenV2().subscribe(() => {
                expect(mockConfig.api_authentication).not.toBeUndefined();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            });
        });

        it('should return BearerTokenFromKongV2 for catch part', (done) => {
            mockConfig.api_authentication = {
                mobileAppConsumer: 'sample-mobile-app-consumar',
                mobileAppKey: 'sample-mobile-app-key',
                mobileAppSecret: 'sample-mobileAppSecret'
            } as any;
            mockApiService.fetch = jest.fn(() => throwError({
                response: {
                    responseCode: ResponseCode.HTTP_UNAUTHORISED,
                    headers: {
                        location: 'sample-area'
                    }
                }
            })) as any;
            // act
            apiTokenHandler.refreshAuthTokenV2().subscribe(() => {
                expect(mockConfig.api_authentication).not.toBeUndefined();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            });
        });
    });
});
