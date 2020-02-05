import {SunbirdSdk} from '../../../../sdk';
import {TelemetryService} from '../../../../telemetry';
import {ApiService} from '../../../../api';
import {EventsBusService} from '../../../../events-bus';
import {mockManualMergeConfig} from './webview-manual-merge-session-provider.spec.data';
import {of} from 'rxjs';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewManualMergeSessionProvider} from './webview-manual-merge-session-provider';

const mockSunbirdSdk: Partial<SunbirdSdk> = {};
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;

describe('WebviewManualMergeSessionProvider', () => {
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockWebviewRunner: Partial<WebviewRunner> = {};

    let webviewManualMergeSessionProvider: WebviewManualMergeSessionProvider;

    beforeAll(() => {
        (mockSunbirdSdk as any)['apiService'] = mockApiService as ApiService;
        (mockSunbirdSdk as any)['eventsBusService'] = mockEventsBusService as EventsBusService;
        (mockSunbirdSdk as any)['sdkConfig'] = {apiConfig: {}};
        (mockSunbirdSdk as any)['telemetryService'] = mockTelemetryService;

        webviewManualMergeSessionProvider = new WebviewManualMergeSessionProvider(
            mockManualMergeConfig,
            mockWebviewRunner as WebviewRunner
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(webviewManualMergeSessionProvider).toBeTruthy();
    });

    describe('provide()', () => {
        it('should attach pdata as query param when launching webview', (done) => {
            const mockSession = {
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            };
            const mockPdata = {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'};
            mockTelemetryService.buildContext = jest.fn().mockImplementation(() => {
                return of({
                    pdata: mockPdata
                });
            });
            mockWebviewRunner.launchWebview = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve(mockSession));
            mockManualMergeConfig.return = [];

            webviewManualMergeSessionProvider.provide().then(() => {
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
});
