import {SunbirdSdk} from '../../../../sdk';
import {TelemetryService} from '../../../../telemetry';
import {ApiService} from '../../../../api';
import {EventsBusService} from '../../../../events-bus';
import {WebviewRunner} from '../def/webview-runner';
import {of} from 'rxjs';
import {WebviewAutoMergeSessionProvider} from './webview-auto-merge-session-provider';
import {mockMigrateConfig} from './webview-auto-merge-session-provider.spec.data';

const mockSunbirdSdk: Partial<SunbirdSdk> = {};
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;

describe('WebviewAutoMergeSessionProvider', () => {
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockWebviewRunner: Partial<WebviewRunner> = {};

    let webviewAutoMergeSessionProvider: WebviewAutoMergeSessionProvider;

    beforeAll(() => {
        (mockSunbirdSdk as any)['apiService'] = mockApiService as ApiService;
        (mockSunbirdSdk as any)['eventsBusService'] = mockEventsBusService as EventsBusService;
        (mockSunbirdSdk as any)['sdkConfig'] = {apiConfig: {}};
        (mockSunbirdSdk as any)['telemetryService'] = mockTelemetryService;

        webviewAutoMergeSessionProvider = new WebviewAutoMergeSessionProvider(
            mockMigrateConfig,
            mockWebviewRunner as WebviewRunner,
            {}
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(webviewAutoMergeSessionProvider).toBeTruthy();
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
            mockWebviewRunner.redirectTo = jest.fn().mockImplementation(() => Promise.resolve());
            mockWebviewRunner.any = jest.fn().mockImplementation(() => Promise.resolve(mockSession));
            mockMigrateConfig.return = [];

            webviewAutoMergeSessionProvider.provide().then(() => {
                expect(mockWebviewRunner.redirectTo).toHaveBeenCalledWith(
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
