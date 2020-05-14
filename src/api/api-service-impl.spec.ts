import {ApiServiceImpl} from './api-service-impl';
import {Container} from 'inversify';
import {DeviceInfo, ErrorEventType, EventsBusService, SdkConfig, SharedPreferences} from '..';
import {CsHttpService} from '@project-sunbird/client-services/core/http-service/interface';
import {of, throwError} from 'rxjs';
import {InjectionTokens} from '../injection-tokens';
import {CsHttpServerError} from '@project-sunbird/client-services/core/http-service';
import {CsModule} from '@project-sunbird/client-services';
import {ApiTokenHandler} from './handlers/api-token-handler';
import {ApiKeys} from '../preference-keys';

jest.mock('@project-sunbird/client-services', () => {
    return {
        CsModule: {
            instance: {
                config: {
                    core: {
                        api: {
                            authentication: {
                                userToken: ''
                            }
                        }
                    }
                },
                updateConfig: jest.fn().mockImplementation(() => {
                })
            }
        }
    };
});

jest.mock('./handlers/api-token-handler');

describe('ApiServiceImpl', () => {
    let apiServiceImpl: ApiServiceImpl;
    const mockContainer: Partial<Container> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockHttpService: Partial<CsHttpService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        apiServiceImpl = new ApiServiceImpl(
            mockContainer as Container,
            mockSdkConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockEventsBusService as EventsBusService,
            mockHttpService as CsHttpService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of apiServiceImpl', () => {
        expect(apiServiceImpl).toBeTruthy();
    });

    it('bearerTokenRefreshInterceptor', () => {
        mockContainer.get = jest.fn(() => ({apiconfig: ''})) as any;
        expect(apiServiceImpl.bearerTokenRefreshInterceptor).toBeTruthy();
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.SHARED_PREFERENCES);
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.SDK_CONFIG);
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.DEVICE_INFO);
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.API_SERVICE);
    });

    it('userTokenRefreshInterceptor', () => {
        mockContainer.get = jest.fn(() => ({})) as any;
        expect(apiServiceImpl.userTokenRefreshInterceptor).toBeTruthy();
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.API_SERVICE);
        expect(mockContainer.get).toHaveBeenCalledWith(InjectionTokens.AUTH_SERVICE);
    });

    describe('fetch', () => {
        it('should return bareartoken and user token', (done) => {
            const request = {
                requestInterceptors: [],
                responseInterceptors: []
            } as any;
            mockHttpService.fetch = jest.fn(() => of({})) as any;
            // act
            apiServiceImpl.fetch(request).subscribe(() => {
                done();
            });
        });

        it('should return http error for httpService', (done) => {
            const request = {
                requestInterceptors: [],
                responseInterceptors: [],
                withBearerToken: true,
                withUserToken: true
            } as any;
            const response: CsHttpServerError = {
                response: {},
                message: ErrorEventType.HTTP_SERVER_ERROR
            } as any;
            mockHttpService.fetch = jest.fn(() => throwError(response));
            mockEventsBusService.emit = jest.fn();
            // act
            apiServiceImpl.fetch(request).toPromise().catch((e) => {
                expect(e.message).toBe(ErrorEventType.HTTP_SERVER_ERROR);
                done();
            });
        });
    });

    describe('onInit', () => {
        it('should setup sharePreference listener to update CsModule bearer token when changed', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('some_token'));
            mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
                listener('some_value');
            });

            // act
            apiServiceImpl.onInit().subscribe(() => {
                // assert
                expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(CsModule.instance.config);
                done();
            });
        });

        it('should setup sharePreference listener to update CsModule bearer token when removed', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('some_token'));
            mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
                listener('');
            });

            // act
            apiServiceImpl.onInit().subscribe(() => {
                // assert
                expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(CsModule.instance.config);
                done();
            });
        });

        it('should fetch bearer token if not set', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(''));
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
            mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
                listener('');
            });
            (ApiTokenHandler as any).mockImplementation(() => {
                return {
                    refreshAuthToken: () => {
                        return of('some_bearer_token');
                    }
                };
            });
            // act
            apiServiceImpl.onInit().subscribe(() => {
                // assert
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(ApiKeys.KEY_API_TOKEN, 'some_bearer_token');
                done();
            });
        });
    });
});
