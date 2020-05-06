import {BearerTokenRefreshInterceptor} from './bearer-token-refresh-interceptor';
import {ApiConfig, ApiService, DeviceInfo, HttpRequestType, Request, Response, ResponseCode, SharedPreferences} from '../../../index';
import {of} from 'rxjs';
import {ApiKeys} from '../../../preference-keys';
import {ApiTokenHandler} from '../../handlers/api-token-handler';

jest.mock('../../../api/handlers/api-token-handler');

describe('BearerTokenRefreshInterceptor', () => {
    let apiAuthenticator: BearerTokenRefreshInterceptor;
    const mockApiConfig: Partial<ApiConfig> = {
        host: 'SAMPLE_HOST',
        user_authentication: {
            redirectUrl: 'SAMPLE_REDIRECT_URL',
            authUrl: 'SAMPLE_AUTH_URL',
            mergeUserHost: '',
            autoMergeApiPath: ''
        },
        api_authentication: {
            mobileAppKey: 'SAMPLE_MOBILE_APP_KEY',
            mobileAppSecret: 'SAMPLE_MOBILE_APP_SECRET',
            mobileAppConsumer: 'SAMPLE_MOBILE_APP_CONSTANT',
            channelId: 'SAMPLE_CHANNEL_ID',
            producerId: 'SAMPLE_PRODUCER_ID',
            producerUniqueId: 'SAMPLE_PRODUCER_UNIQUE_ID'
        },
        cached_requests: {
            timeToLive: 2 * 60 * 60 * 1000
        }
    };

    const mockApiService: Partial<ApiService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        apiAuthenticator = new BearerTokenRefreshInterceptor(
            mockSharedPreferences as SharedPreferences,
            mockApiConfig as ApiConfig,
            mockDeviceInfo as DeviceInfo,
            mockApiService as ApiService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (ApiTokenHandler as any as jest.Mock<ApiTokenHandler>).mockClear();
    });

    it('should be create a instance of apiAuthenticator', () => {
        expect(apiAuthenticator).toBeTruthy();
    });

    it('should put bearerToken into local by invoked interceptResponse()', async(done) => {
        // arrange
        const res = new Response();
        res.responseCode = ResponseCode.HTTP_UNAUTHORISED;
        res.responseCode = ResponseCode.HTTP_FORBIDDEN;
        res.body = {
            message: 'Unauthorized'
        };
        const request = new Request.Builder()
        .withPath('/')
        .withType(HttpRequestType.POST)
        .withBody(new Uint8Array([]))
        .withHeaders({
            'content_type': 'application/text'
        })
        .build();

        (ApiTokenHandler.prototype.refreshAuthToken as jest.Mock).mockReturnValue(of('SAMPLE_REFRESH_TOKEN'));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        mockApiService.fetch = jest.fn().mockImplementation(() => of({}));
        // act
       await apiAuthenticator.interceptResponse(request, res).subscribe(() => {
            // assert
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(ApiKeys.KEY_API_TOKEN, expect.any(String));
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

    it('should not put bearerToken into local if responseCode unavailable by invoked interceptResponse()', async(done) => {
        // arrange
        const res = new Response();
        const request = new Request.Builder()
        .withPath('/')
        .withType(HttpRequestType.POST)
        .withBody(new Uint8Array([]))
        .withHeaders({
            'content_type': 'application/text'
        })
        .build();
        // act
       await apiAuthenticator.interceptResponse(request, res).subscribe(() => {
            // assert
            done();
        });
    });
});
