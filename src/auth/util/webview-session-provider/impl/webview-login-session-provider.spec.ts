import {ApiService} from '../../../../api';
import {EventsBusService} from '../../../../events-bus';
import {mockSdkConfig} from '../../../../page/impl/page-assemble-service-impl.spec.data';
import {WebviewLoginSessionProvider} from './webview-login-session-provider';
import {
    loginConfig,
    loginConfigForGoogle,
    loginConfigForPassword,
    loginConfigForReset,
    loginConfigForState,
    loginConfigForStateError,
    mergeConfig
} from './webview-login-session-provider.spec.data';
import {WebviewRunner} from '../def/webview-runner';
import {OAuthSession, SignInError} from '../../..';
import {of} from 'rxjs';
import {TelemetryService} from '../../../../telemetry';
import {SunbirdSdk} from '../../../../sdk';
import { JwtUtil } from '../../../../util/jwt-util';

const mockApiService: Partial<ApiService> = {};
const mockEventsBusService: Partial<EventsBusService> = {};
const mockWebviewRunner: Partial<WebviewRunner> = {};
const mockTelemetryService: Partial<TelemetryService> = {
    buildContext: () => of({
        pdata: {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'}
    })
} as any;

const mockSunbirdSdk: Partial<SunbirdSdk> = {
    sdkConfig: mockSdkConfig,
    apiService: mockApiService,
    eventsBusService: mockEventsBusService,
    telemetryService: mockTelemetryService
} as any;
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;

describe('WebviewLoginSessionProvider', () => {
    let webviewLoginSessionProvider: WebviewLoginSessionProvider;
    const mockAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsclI0MWpJNndlZmZoQldnaUpHSjJhNlowWDFHaE53a21IU3pzdzE0R0MwIn0.eyJqdGkiOiJmYjU3MzRiMC1kNDU0LTRkNDYtYmVmMC1lNzA4ZDg4Njc3OGQiLCJleHAiOjE1OTc1NTg2NTYsIm5iZiI6MCwiaWF0IjoxNTk3NDcyMjU2LCJpc3MiOiJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJwcm9qZWN0LXN1bmJpcmQtZGV2LWNsaWVudCIsInN1YiI6ImY6NWE4YTNmMmItMzQwOS00MmUwLTkwMDEtZjkxM2JjMGZkZTMxOjg0NTRjYjIxLTNjZTktNGUzMC04NWI1LWZhZGUwOTc4ODBkOCIsInR5cCI6IkJlYXJlciIsImF6cCI6InByb2plY3Qtc3VuYmlyZC1kZXYtY2xpZW50IiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2RjZTliNjAtOWVlNy00NGM4LThmNjAtOTE0NmQ5NWE5ODU3IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJNZW50b3IgRmlyc3QgVXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6Im50cHRlc3QxMDQiLCJnaXZlbl9uYW1lIjoiTWVudG9yIEZpcnN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZW1haWwiOiJ1cyoqKioqKioqQHRlc3Rzcy5jb20ifQ.some-signature';
    const mockRefreshToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsclI0MWpJNndlZmZoQldnaUpHSjJhNlowWDFHaE53a21IU3pzdzE0R0MwIn0.eyJqdGkiOiJmYjU3MzRiMC1kNDU0LTRkNDYtYmVmMC1lNzA4ZDg4Njc3OGQiLCJleHAiOjE1OTc1NTg2NTYsIm5iZiI6MCwiaWF0IjoxNTk3NDcyMjU2LCJpc3MiOiJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJwcm9qZWN0LXN1bmJpcmQtZGV2LWNsaWVudCIsInN1YiI6ImY6NWE4YTNmMmItMzQwOS00MmUwLTkwMDEtZjkxM2JjMGZkZTMxOjg0NTRjYjIxLTNjZTktNGUzMC04NWI1LWZhZGUwOTc4ODBkOCIsInR5cCI6IkJlYXJlciIsImF6cCI6InByb2plY3Qtc3VuYmlyZC1kZXYtY2xpZW50IiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2RjZTliNjAtOWVlNy00NGM4LThmNjAtOTE0NmQ5NWE5ODU3IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJNZW50b3IgRmlyc3QgVXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6Im50cHRlc3QxMDQiLCJnaXZlbl9uYW1lIjoiTWVudG9yIEZpcnN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZW1haWwiOiJ1cyoqKioqKioqQHRlc3Rzcy5jb20ifQ.some-signature';
    let customWebViewConfig: any;

    beforeAll(() => {
        webviewLoginSessionProvider = new WebviewLoginSessionProvider(
            loginConfig,
            mergeConfig,
            customWebViewConfig,
            mockWebviewRunner as WebviewRunner
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        jest.restoreAllMocks();
        window['device'] = {uuid: 'some_uuid', platform:'android'};
        const mockPdata = {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'};
        mockTelemetryService.buildContext = jest.fn().mockImplementation(() => {
            return of({
                pdata: mockPdata
            });
        });
    });

    it('should be able to create an instance', () => {
        expect(webviewLoginSessionProvider).toBeTruthy();
    });

    describe('provide()', () => {
        it('should delegate launch to webviewRunner', () => {
            // arrange
            mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.capture = jest.fn().mockImplementation(() => new Promise(() => {
            }));
            mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => new Promise(() => {
            }));
            mockWebviewRunner.success = jest.fn().mockImplementation(() => new Promise(() => {
            }));
            mockWebviewRunner.resolveCaptured = jest.fn().mockImplementation(() => new Promise(() => {
            }));
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve<OAuthSession>({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));

            // act
            webviewLoginSessionProvider.provide().then((result) => {
                // assert
                setTimeout(() => {
                    expect(result).toBeTruthy();
                }, 0);
            });
        });

        it('should attach pdata as query param when launching webview', () => {
            const loginConfigWithNoReturn = {...loginConfig};
            loginConfigWithNoReturn.return = [];

            webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                loginConfigWithNoReturn,
                mergeConfig,
                mockWebviewRunner as WebviewRunner
            );

            const mockSession = {
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            };
            mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve(mockSession));

            webviewLoginSessionProvider.provide()
            // .then(() => {
            //     setTimeout(() => {
            //         // expect(mockWebviewRunner.launchWebview).toHaveBeenCalled()
            //         // expect(mockWebviewRunner.launchWebview).toHaveBeenCalledWith(
            //         //     expect.objectContaining({
            //         //         params: expect.objectContaining({
            //         //             pdata: JSON.stringify({'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'})
            //         //         })
            //         //     })
            //         // );
            //         done();
            //     }, 0);
            // });
        });

        it('should set path for context type password when launching webview', (done) => {
            const loginConfigWithNoReturn = {...loginConfig};
            loginConfigWithNoReturn.context = "password"
            loginConfigWithNoReturn.target.path = "/recover/identify/account";
            loginConfigWithNoReturn.return = [];

            webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                loginConfigWithNoReturn,
                mergeConfig,
                customWebViewConfig,
                mockWebviewRunner as WebviewRunner
            );

            const mockSession = {
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            };
            mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve(mockSession));

            webviewLoginSessionProvider.provide().then(() => {
                expect(mockWebviewRunner.launchWebview).toHaveBeenCalledWith(
                    expect.objectContaining({
                        params: expect.objectContaining({
                            pdata: JSON.stringify({'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'})
                        })
                    })
                );
                done();
            });
        });

        it('should set path for context type password when launching webview', () => {
            const loginConfigWithNoReturn = {...loginConfig};
            loginConfigWithNoReturn.context = "password"
            loginConfigWithNoReturn.target.path = "/recover/identify/account";
            loginConfigWithNoReturn.return = [];

            webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                loginConfigWithNoReturn,
                mergeConfig,
                mockWebviewRunner as WebviewRunner
            );

            const mockSession = {
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            };
            mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve(mockSession));

            webviewLoginSessionProvider.provide();
            setTimeout(() => {
                expect(mockWebviewRunner.launchWebview).toHaveBeenCalledWith(
                    expect.objectContaining({
                        params: expect.objectContaining({
                            pdata: JSON.stringify({'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'})
                        })
                    })
                );
            }, 0);
        });

        describe('when config case passes', () => {
            describe('when config case:password', () => {
                it('should resolve session when API succeeds', (done) => {
                    window['device'] = { uuid: 'some_uuid', platform:'ios' };
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForPassword,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    mockApiService.fetch = jest.fn().mockImplementation(() => {
                        return of({
                            body: {
                                access_token: mockAccessToken,
                                refresh_token: mockRefreshToken,
                            }
                        });
                    });

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve({'code': 'SOME_CODE'}));
                    jest.spyOn(JwtUtil, 'decodeJWT').mockImplementation(() => Promise.resolve(`{ "iss": "https://staging.sunbirded.org/auth/realms/sunbird",
                    "exp": 1711023727,
                    "sub": "f:979738b7-253c-4adf-9673-a857eeb86115:372504c7-838a-433c-a24d-f8ac0ed5c480"}`));
                    
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().then((session) => {
                        // assert
                        expect(mockApiService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                            body: expect.objectContaining({
                                code: 'SOME_CODE'
                            })
                        }));
                        expect(session).toEqual({
                            accessTokenExpiresOn: expect.any(Number),
                            access_token: mockAccessToken,
                            refresh_token: mockRefreshToken,
                            userToken: '372504c7-838a-433c-a24d-f8ac0ed5c480'
                        });
                        done();
                    });
                });

                it('should reject without session when API fails or has incorrect response', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForPassword,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    mockApiService.fetch = jest.fn().mockImplementation(() => {
                        return of({
                            body: {}
                        });
                    });

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve({'id': 'SOME_ID'}));
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error instanceof SignInError).toBeTruthy();
                        done();
                    });
                });
            });

            describe('when config case:state', () => {
                it('should resolve session when API succeeds', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForState,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    mockApiService.fetch = jest.fn().mockImplementation(() => {
                        return of({
                            body: {
                                access_token: mockAccessToken,
                                refresh_token: mockRefreshToken,
                            }
                        });
                    });

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve({'id': 'SOME_ID'}));
                    jest.spyOn(JwtUtil, 'decodeJWT').mockImplementation(() => Promise.resolve(`{"exp": 1711023727,
                        "sub": "f:979738b7-253c-4adf-9673-a857eeb86115:372504c7-838a-433c-a24d-f8ac0ed5c480"}`));
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().then((session) => {
                        // assert
                        expect(mockApiService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                            path: '/v1/sso/create/session?id=SOME_ID'
                        }));
                        expect(session).toEqual({
                            accessTokenExpiresOn: expect.any(Number),
                            access_token: mockAccessToken,
                            refresh_token: mockRefreshToken,
                            userToken: '372504c7-838a-433c-a24d-f8ac0ed5c480'
                        });
                        done();
                    });
                });

                it('should reject without session when API fails or has incorrect response', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForState,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    mockApiService.fetch = jest.fn().mockImplementation(() => {
                        return of({
                            body: {}
                        });
                    });

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve({'code': 'SOME_CODE'}));
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error instanceof SignInError).toBeTruthy();
                        done();
                    });
                });
            });

            describe('when config case:google', () => {
                xit('should resolve session sign-in succeeds', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForGoogle,
                        mergeConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    const successStack = [{
                        'access_token': mockAccessToken,
                        'refresh_token': mockRefreshToken,
                    }, {
                        'googleRedirectUrl': 'http://google_redirect_url.com'
                    }];
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve(successStack.pop()));
                    mockWebviewRunner.getCaptureExtras = jest.fn().mockImplementation(() => Promise.resolve({'extra': 'value'}));
                    mockWebviewRunner.launchCustomTab = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().then((session) => {
                        // assert
                        expect(session).toEqual({
                            accessTokenExpiresOn: expect.any(Number),
                            access_token: mockAccessToken,
                            refresh_token: mockRefreshToken,
                            userToken: '8454cb21-3ce9-4e30-85b5-fade097880d8'
                        });
                        done();
                    });
                });

                it('should reject without session when sign-in fails or has incorrect response', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForGoogle,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    const successStack = [{}, {
                        'googleRedirectUrl': 'http://google_redirect_url.com'
                    }];
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve(successStack.pop()));
                    mockWebviewRunner.getCaptureExtras = jest.fn().mockImplementation(() => Promise.resolve({'extra': 'value'}));
                    mockWebviewRunner.launchCustomTab = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error instanceof SignInError).toBeFalsy();
                        done();
                    });
                });

                it('should reject without session when sign-in fails with server error_message', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForGoogle,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    const successStack = [{
                        'error_message': 'Some error message'
                    }, {
                        'googleRedirectUrl': 'http://google_redirect_url.com'
                    }];
                    mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve(successStack.pop()));
                    mockWebviewRunner.getCaptureExtras = jest.fn().mockImplementation(() => Promise.resolve({'extra': 'value'}));
                    mockWebviewRunner.launchCustomTab = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error instanceof SignInError).toBeFalsy();
                        expect((error as SignInError).message === 'Some error message');
                        done();
                    });
                });
            });

            describe('when config case:state-error', () => {
                it('should throw error with server error_message when "state-error" is captured with error_message', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForStateError,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.resolveCaptured = jest.fn().mockImplementation(() => Promise.resolve('SOME_ERROR_MESSAGE'));
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error).toBeTruthy();
                        expect(error instanceof SignInError).toBeTruthy();
                        expect(error instanceof SignInError && error.message).toEqual('SOME_ERROR_MESSAGE');
                        expect(mockWebviewRunner.resolveCaptured).toHaveBeenCalledWith('error_message');
                        done();
                    });
                });

                it('should throw error with generic error message when "state-error" is captured without error_message', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForStateError,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.resolveCaptured = jest.fn().mockImplementation(() => Promise.reject());
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch((error) => {
                        // assert
                        expect(error).toBeTruthy();
                        expect(error instanceof SignInError).toBeTruthy();
                        expect(error instanceof SignInError && error.message).toEqual('Server Error');
                        expect(mockWebviewRunner.resolveCaptured).toHaveBeenCalledWith('error_message');
                        done();
                    });
                });
            });

            describe('when config case:reset', () => {
                it('should capture params and reset/relaunch webview when config type "reset" is captured', (done) => {
                    webviewLoginSessionProvider = new WebviewLoginSessionProvider(
                        loginConfigForReset,
                        mergeConfig,
                        customWebViewConfig,
                        mockWebviewRunner as WebviewRunner
                    );

                    // arrange
                    const mockPdata = {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'};
                    mockTelemetryService.buildContext = jest.fn().mockImplementation(() => {
                        return of({
                            pdata: mockPdata
                        });
                    });
                    const orderStack = [() => Promise.reject(), () => Promise.resolve()];
                    mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => orderStack.pop()!());
                    mockWebviewRunner.capture = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.getCaptureExtras = jest.fn().mockImplementation(() => Promise.resolve(
                        {'SOME_EXTRA_PARAM': 'SOME_EXTRA_VALUE'}
                    ));
                    mockWebviewRunner.closeWebview = jest.fn().mockImplementation(() => Promise.resolve());
                    mockWebviewRunner.any = jest.fn().mockImplementation((params) => Promise.race([params]));

                    // act
                    webviewLoginSessionProvider.provide().catch(() => {
                        // assert
                        expect(mockWebviewRunner.launchWebview).nthCalledWith(2, expect.objectContaining({
                            params: expect.objectContaining({
                                ...loginConfigForReset.target.params.reduce((acc, p) => {
                                    acc[p.key] = p.value;
                                    return acc;
                                }, {}),
                                'SOME_EXTRA_PARAM': 'SOME_EXTRA_VALUE'
                            })
                        }));
                        done();
                    });
                });
            });
        });
    });
});
