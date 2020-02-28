import {ApiService} from '../../../../api';
import {EventsBusService} from '../../../../events-bus';
import {mockSdkConfig} from '../../../../page/impl/page-assemble-service-impl.spec.data';
import {WebviewLoginSessionProvider} from './webview-login-session-provider';
import {loginConfig, loginConfigForStateError, mergeConfig} from './webview-login-session-provider.spec.data';
import {WebviewRunner} from '../def/webview-runner';
import {OAuthSession, SignInError} from '../../..';
import {of} from 'rxjs';
import {TelemetryService} from '../../../../telemetry';
import {SunbirdSdk} from '../../../../sdk';

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

    beforeAll(() => {
        webviewLoginSessionProvider = new WebviewLoginSessionProvider(
            loginConfig,
            mergeConfig,
            mockWebviewRunner as WebviewRunner
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(webviewLoginSessionProvider).toBeTruthy();
    });

    it('should delegate launch to webviewRunner on provide()', (done) => {
        // arrange
        mockWebviewRunner.launchWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.capture = jest.fn(() => new Promise(() => {
        }));
        mockWebviewRunner.closeWebview = jest.fn(() => new Promise(() => {
        }));
        mockWebviewRunner.success = jest.fn(() => new Promise(() => {
        }));
        mockWebviewRunner.resolveCaptured = jest.fn(() => new Promise(() => {
        }));
        mockWebviewRunner.any = jest.fn(() => Promise.resolve<OAuthSession>({
            access_token: 'SOME_ACCESS_TOKEN',
            refresh_token: 'SOME_REFRESH_TOKEN',
            userToken: 'SOME_USER_TOKEN'
        }));

        // act
        webviewLoginSessionProvider.provide().then((result) => {
            // assert
            expect(mockWebviewRunner.launchWebview).toHaveBeenCalled();
            expect(result).toBeTruthy();
            done();
        });
    });

    it('should throw error with server error_message when "state-error" is captured with error_message', (done) => {
        webviewLoginSessionProvider = new WebviewLoginSessionProvider(
            loginConfigForStateError,
            mergeConfig,
            mockWebviewRunner as WebviewRunner
        );

        // arrange
        mockWebviewRunner.launchWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.capture = jest.fn(() => Promise.resolve());
        mockWebviewRunner.closeWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.resolveCaptured = jest.fn(() => Promise.resolve('SOME_ERROR_MESSAGE'));
        mockWebviewRunner.any = jest.fn((...params) => Promise.race(params));

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
            mockWebviewRunner as WebviewRunner
        );

        // arrange
        mockWebviewRunner.launchWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.capture = jest.fn(() => Promise.resolve());
        mockWebviewRunner.closeWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.resolveCaptured = jest.fn(() => Promise.reject());
        mockWebviewRunner.any = jest.fn((...params) => Promise.race(params));

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

    it('should attach pdata as query param when launching webview', (done) => {
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
        const mockPdata = {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'};
        mockTelemetryService.buildContext = jest.fn(() => {
            return of({
                pdata: mockPdata
            });
        });
        mockWebviewRunner.launchWebview = jest.fn(() => Promise.resolve());
        mockWebviewRunner.any = jest.fn(() => Promise.resolve(mockSession));

        webviewLoginSessionProvider.provide().then(() => {
            expect(mockWebviewRunner.launchWebview).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        pdata: JSON.stringify(mockPdata)
                    })
                })
            );
            done();
        });
    });
});
