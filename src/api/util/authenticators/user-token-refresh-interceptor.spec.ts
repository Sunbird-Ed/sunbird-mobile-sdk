import {UserTokenRefreshInterceptor} from './user-token-refresh-interceptor';
import {ApiConfig, ApiService, AuthService, HttpRequestType, Request, Response, ResponseCode, SharedPreferences} from '../../../index';
import {of} from 'rxjs';

describe('SessionAuthenticator', () => {
    let sessionAuthenticator: UserTokenRefreshInterceptor;
    const mockApiConfig: Partial<ApiConfig> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        sessionAuthenticator = new UserTokenRefreshInterceptor(
            mockApiService as ApiService,
            mockAuthService as AuthService
        );
        });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create a instance of SessionAuthenticator', () => {
            expect(sessionAuthenticator).toBeTruthy();
        });

        it('should return response for responseCode is not available by invoked interceptResponse() ', (done) => {
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
            sessionAuthenticator.interceptResponse(request, res).subscribe(() => {
                // assert
                expect(res.responseCode).not.toBe(ResponseCode.HTTP_UNAUTHORISED);
                done();
            });
        });

        it('should return response if message body is available by invoked interceptResponse() ', (done) => {
            // arrange
            const res = new Response();
            res.responseCode = ResponseCode.HTTP_UNAUTHORISED;
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
            // act
            sessionAuthenticator.interceptResponse(request, res).subscribe(() => {
                // assert
                expect(res.responseCode).toBe(ResponseCode.HTTP_UNAUTHORISED);
                expect(res.body.message).not.toBeNull();
                done();
            });
        });

        it('should refresh auth tokenby invoked interceptResponse() ', (done) => {
            // arrange
            const res = new Response();
            res.responseCode = ResponseCode.HTTP_UNAUTHORISED;
            res.body = {};
            const request = new Request.Builder()
            .withPath('/')
            .withType(HttpRequestType.POST)
            .withBody(new Uint8Array([]))
            .withHeaders({
                'content_type': 'application/text'
            })
            .build();
            mockAuthService.refreshSession = jest.fn().mockImplementation(() => of({}));
            mockApiService.fetch = jest.fn().mockImplementation(() => of({}));
            // act
            sessionAuthenticator.interceptResponse(request, res).subscribe(() => {
                // assert
                expect(res.responseCode).toBe(ResponseCode.HTTP_UNAUTHORISED);
                expect(res.body.message).toBeUndefined();
                expect(mockAuthService.refreshSession).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            });
        });
});
