import {Container} from 'inversify';
import {ApiService} from './def/api-service';
import {InjectionTokens} from '../injection-tokens';
import {ApiServiceImpl} from './api-service-impl';
import {SdkConfig} from '../sdk-config';
import {mockSdkConfigWithSampleApiConfig} from './api-service-impl.spec.data';
import {DeviceInfo} from '../util/device';
import {SharedPreferences} from '../util/shared-preferences';
import {ApiKeys} from '../preference-keys';
import {Observable} from 'rxjs';
import {FetchHandler} from './handlers/fetch-handler';
import {Response} from './def/response';
import {HttpRequestType, Request} from './def/request';

jest.mock('./handlers/fetch-handler');

describe('ApiServiceImpl', () => {
    let apiService: ApiService;

    const container = new Container();
    const mockDeviceInfoService: Partial<DeviceInfo> = {
        getDeviceID: jest.fn(() => {
        }),
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => {
        }),
        putString: jest.fn(() => {
        }),
    };

    beforeAll(() => {
        container.bind<ApiService>(InjectionTokens.API_SERVICE).to(ApiServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithSampleApiConfig as SdkConfig);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfoService as DeviceInfo);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);

        apiService = container.get(InjectionTokens.API_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (FetchHandler as jest.Mock<FetchHandler>).mockClear();
    });

    it('should return an instance of ApiServiceImpl from container', () => {
        expect(apiService).toBeTruthy();
    });

    describe('should check for API token onInit()', () => {
        it('should fetch new API token if not found', (done) => {
            // arrange
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of(''));
            (mockSharedPreferences.putString as jest.Mock).mockReturnValue(Observable.of(undefined));
            (mockDeviceInfoService.getDeviceID as jest.Mock).mockReturnValue('SAMPLE_DEVICE_ID');

            spyOn(apiService, 'fetch').and.returnValue(Observable.of({
                body: {
                    result: {
                        secret: 'SAMPLE_SECRET'
                    }
                }
            }));

            // act
            apiService.onInit().subscribe(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ApiKeys.KEY_API_TOKEN);
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(
                    ApiKeys.KEY_API_TOKEN, expect.stringMatching(/[a-z]+.[a-z]+.[a-z]+/i)
                );
                expect(apiService.fetch).toHaveBeenCalled();

                done();
            });
        });

        it('should do nothing if API token found', (done) => {
            // arrange
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of('SAMPLE_API_TOKEN'));

            spyOn(apiService, 'fetch').and.stub();

            // act
            apiService.onInit().subscribe(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ApiKeys.KEY_API_TOKEN);
                expect(apiService.fetch).not.toHaveBeenCalled();

                done();
            });
        });

        it('should fail gracefully if fetch API token fails', (done) => {
            // arrange
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of(''));
            (mockSharedPreferences.putString as jest.Mock).mockReturnValue(Observable.of(undefined));
            (mockDeviceInfoService.getDeviceID as jest.Mock).mockReturnValue('SAMPLE_DEVICE_ID');

            spyOn(apiService, 'fetch').and.throwError('some error');

            // act
            apiService.onInit().subscribe(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ApiKeys.KEY_API_TOKEN);
                done();
            });
        });
    });

    it('should delegate to FetchHandler.doFetch() on fetch()', (done) => {
        // arrange
        (FetchHandler as jest.Mock<FetchHandler>).mockImplementation(() => {
            return {
                doFetch: jest.fn(() => Observable.of(new Response()))
            };
        });

        // act
        apiService.fetch((new Request.Builder())
            .withPath('SAMPLE_PATH')
            .withType(HttpRequestType.GET)
            .build())
            .subscribe(() => {
                done();
            });
    });

    it('should be able to setDefaultApiAuthenticators()', () => {
        // act
        apiService.setDefaultApiAuthenticators([]);
    });

    it('should be able to setDefaultSessionAuthenticators()', () => {
        // act
        apiService.setDefaultSessionAuthenticators([]);
    });
});
