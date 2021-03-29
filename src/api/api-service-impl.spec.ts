import {ApiServiceImpl} from './api-service-impl';
import {Container} from 'inversify';
import {
    ApiConfig,
    DeviceInfo,
    ErrorEventType,
    EventNamespace,
    EventsBusService,
    HttpRequestType,
    Request,
    Response,
    SdkConfig,
    SharedPreferences
} from '..';
import {CsHttpService} from '@project-sunbird/client-services/core/http-service/interface';
import {of, throwError} from 'rxjs';
import {InjectionTokens} from '../injection-tokens';
import {CsHttpClientError, CsHttpServerError} from '@project-sunbird/client-services/core/http-service';
import {CsModule} from '@project-sunbird/client-services';
import {ApiTokenHandler} from './handlers/api-token-handler';
import {ApiKeys} from '../preference-keys';
import {CsRequestLoggerInterceptor} from '@project-sunbird/client-services/core/http-service/utilities/interceptors';
import {CsResponseLoggerInterceptor} from '@project-sunbird/client-services/core/http-service/utilities/interceptors';

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

describe('ApiServiceImpl:debugMode false', () => {
    let apiServiceImpl: ApiServiceImpl;
    const mockContainer: Partial<Container> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockHttpService: Partial<CsHttpService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {
        apiConfig: {
            debugMode: false
        } as Partial<ApiConfig> as ApiConfig
    };
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
        describe('when successful', () => {
            it('should resolve response', (done) => {
                const request = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath('/SOME_PATH')
                    .build();
                mockHttpService.fetch = jest.fn(() => of({})) as any;
                // act
                apiServiceImpl.fetch(request).subscribe((response) => {
                    expect(response).toBeTruthy();
                    done();
                });
            });
        });

        describe('when failed with code 500-599', () => {
            it('should reject with appropriate CsHttpServerError', (done) => {
                const request = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath('/SOME_PATH')
                    .build();
                const response = new Response();
                response.responseCode = 531;
                const error: CsHttpServerError = new CsHttpServerError('SOME_MESSAGE', response);
                mockHttpService.fetch = jest.fn(() => throwError(error));
                mockEventsBusService.emit = jest.fn();
                // act
                apiServiceImpl.fetch(request).toPromise().catch((e) => {
                    expect(CsHttpServerError.isInstance(e)).toBeTruthy();
                    expect(mockEventsBusService.emit).toHaveBeenCalledWith({
                        namespace: EventNamespace.ERROR,
                        event: expect.objectContaining({
                            type: ErrorEventType.HTTP_SERVER_ERROR
                        })
                    });
                    done();
                });
            });
        });

        describe('when failed with code 400-499', () => {
            it('should reject with appropriate CsHttpClientError', (done) => {
                const request = {
                    requestInterceptors: [],
                    responseInterceptors: [],
                    withBearerToken: true,
                    withUserToken: true
                } as any;
                const response: CsHttpClientError = new CsHttpClientError('SOME_MESSAGE', new Response());
                mockHttpService.fetch = jest.fn(() => throwError(response));
                mockEventsBusService.emit = jest.fn();
                // act
                apiServiceImpl.fetch(request).toPromise().catch((e) => {
                    expect(CsHttpClientError.isInstance(e)).toBeTruthy();
                    done();
                });
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

describe('ApiServiceImpl:debugMode true', () => {
    let apiServiceImpl: ApiServiceImpl;
    const mockContainer: Partial<Container> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockHttpService: Partial<CsHttpService> = {};
    const mockSdkConfig: Partial<SdkConfig> = {
        apiConfig: {
            debugMode: true
        } as Partial<ApiConfig> as ApiConfig
    };
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

    it('should be create a instance of apiServiceImpl', () => {
        expect(apiServiceImpl).toBeTruthy();
    });

    describe('setDefaultRequestInterceptors()', () => {
        it('should always append CsRequestLoggerInterceptor', () => {
            // act
            apiServiceImpl.setDefaultRequestInterceptors([]);

            // assert
            expect(apiServiceImpl['defaultRequestInterceptors'].length).toEqual(1);
            expect(apiServiceImpl['defaultRequestInterceptors'][0] instanceof CsRequestLoggerInterceptor).toBeTruthy();
        });
    });

    describe('setDefaultResponseInterceptors()', () => {
        it('should always append CsResponseLoggerInterceptor', () => {
            // act
            apiServiceImpl.setDefaultRequestInterceptors([]);

            // assert
            expect(apiServiceImpl['defaultResponseInterceptors'].length).toEqual(1);
            expect(apiServiceImpl['defaultResponseInterceptors'][0] instanceof CsResponseLoggerInterceptor).toBeTruthy();
        });
    });
});
