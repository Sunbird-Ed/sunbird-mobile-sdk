import { of } from "rxjs";
import { ApiConfig } from "../../../../api";
import { mockSdkConfig } from "../../../../page/impl/page-assemble-service-impl.spec.data";
import { SunbirdSdk } from "../../../../sdk";
import { TelemetryService } from "../../../../telemetry";
import { WebviewRunner } from "../../webview-session-provider/def/webview-runner";
import { WebviewSessionProviderConfig } from "../../webview-session-provider/def/webview-session-provider-config";
import { NativeCustomBrowserSessionProvider } from "./native-custombrowser-session-provider";
import * as qs from 'qs';

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
                updateAuthTokenConfig: jest.fn().mockImplementation(() => {
                })
            }
        }
    };
});
const mockManualLoginConfig: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://login.staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            },
            {
                'key': 'merge_account_process',
                'value': '1'
            },
            {
                'key': 'mergeaccountprocess',
                'value': '1'
            },
            {
                'key': 'goBackUrl',
                'value': 'https://merge.staging.ntp.net.in/?exit=1'
            }
        ]
    },
    'return': [
        {
            'type': 'password',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'code',
                        'resolveTo': 'code'
                    }
                ]
            }
        },
        {
            'type': 'google',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'googleRedirectUrl',
                        'resolveTo': 'googleRedirectUrl'
                    }
                ]
            }
        },
        {
            'type': 'exit',
            'when': {
                'host': 'https://merge.staging.ntp.net.in',
                'path': '/',
                'params': [
                    {
                        'key': 'exit',
                        'resolveTo': 'exit'
                    }
                ]
            }
        }
    ]
};

const mockTelemetryService: Partial<TelemetryService> = {
    buildContext: () => of({
        pdata: {'id': 'staging.diksha.app', 'pid': 'sunbird.app', 'ver': '2.6.local.0-debug'}
    })
} as any;

const mockSunbirdSdk: Partial<SunbirdSdk> = {
    sdkConfig: mockSdkConfig,
    telemetryService: mockTelemetryService
} as any;
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;
const mockWebviewRunner: Partial<WebviewRunner> = {};

describe('NativeCustomBrowserSessionProvider', () => {
    let nativeCustomBrowserSessionProvider: NativeCustomBrowserSessionProvider;
    const mockApiConfig: Partial<ApiConfig> = {};
    const mockAccessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJlYzMwNWNjOC1iZTZlLTRiM2YtODQ2Ni1lYmM4Y2Y0N2FiN2QiLCJleHAiOjE2NTM3MTgyNzgsIm5iZiI6MCwiaWF0IjoxNjUzNjMxOTg3LCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjIxNzY2YzQyLWNlMTItNGU2MC1iYzY0LTMwMzkyMmNlNjlmMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFuZHJvaWQiLCJhdXRoX3RpbWUiOjE2NTM2MzE4NzgsInNlc3Npb25fc3RhdGUiOiI5OGU0M2U4Ni0wMGJiLTQxZWYtODk0Yy00OGQyNzkyNWU1ZTYiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmFtZSI6IkFzZGYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc2RmX2RleGkiLCJnaXZlbl9uYW1lIjoiQXNkZiIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJhcyoqQHlvcG1haWwuY29tIn0.C4cTX5PURgONh4rWGIzrX_bocHm6pnFbd6kWN1LkCjb2hRLdDMhvik3uGyWZ1VcCfF4KE7ryDu1-v2U6b6ysgDP8zgrkN7EX406uYTkSWSKNiUtdM4aOs5MVSkqFRyAPZOeesbV8FzjaHPIdMRgh2aL0nGM6cvhv5WGR3JkReVaPCdUuyemkQ-L5i-EKY3mRr-YIb6ZfwjfLiyI3dx3KGY27ZF7Ge_GGeQnkXGLrWTwJsm6NIb_9bm5NST4KretscCMFx0A6_FKjvK_jeQg38F2mk2iP_nSljqqOY2h0SRU97r9eblE4KarZrSYWiVv62--XLLz4VXZ0zMpPxuuzGA';
    const mockRefreshToken = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsclI0MWpJNndlZmZoQldnaUpHSjJhNlowWDFHaE53a21IU3pzdzE0R0MwIn0.eyJqdGkiOiJmYjU3MzRiMC1kNDU0LTRkNDYtYmVmMC1lNzA4ZDg4Njc3OGQiLCJleHAiOjE1OTc1NTg2NTYsIm5iZiI6MCwiaWF0IjoxNTk3NDcyMjU2LCJpc3MiOiJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJwcm9qZWN0LXN1bmJpcmQtZGV2LWNsaWVudCIsInN1YiI6ImY6NWE4YTNmMmItMzQwOS00MmUwLTkwMDEtZjkxM2JjMGZkZTMxOjg0NTRjYjIxLTNjZTktNGUzMC04NWI1LWZhZGUwOTc4ODBkOCIsInR5cCI6IkJlYXJlciIsImF6cCI6InByb2plY3Qtc3VuYmlyZC1kZXYtY2xpZW50IiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiY2RjZTliNjAtOWVlNy00NGM4LThmNjAtOTE0NmQ5NWE5ODU3IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJNZW50b3IgRmlyc3QgVXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6Im50cHRlc3QxMDQiLCJnaXZlbl9uYW1lIjoiTWVudG9yIEZpcnN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiZW1haWwiOiJ1cyoqKioqKioqQHRlc3Rzcy5jb20ifQ.some-signature';
    
    let customWebViewConfig: Partial<Map<any, any>> = {
        get: jest.fn()
    };

    beforeAll(() => {
        (mockSunbirdSdk as any)['apiconfig'] = mockApiConfig as ApiConfig;

        nativeCustomBrowserSessionProvider = new NativeCustomBrowserSessionProvider(
            mockManualLoginConfig,
            customWebViewConfig,
            mockWebviewRunner as WebviewRunner
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
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
        expect(nativeCustomBrowserSessionProvider).toBeTruthy();
    });

    describe('provide()', () => {
        it('should build a google target url and launch custom tab', () => {
            // arrange
            customWebViewConfig.get = jest.fn(() => true);
            const successStack = [{
                'refresh_token': mockRefreshToken,
                'access_token': mockAccessToken,
            }, {
                'googleRedirectUrl': 'http://google_redirect_url.com'
            }];
            const mockSession = {
                access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJlYzMwNWNjOC1iZTZlLTRiM2YtODQ2Ni1lYmM4Y2Y0N2FiN2QiLCJleHAiOjE2NTM3MTgyNzgsIm5iZiI6MCwiaWF0IjoxNjUzNjMxOTg3LCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjIxNzY2YzQyLWNlMTItNGU2MC1iYzY0LTMwMzkyMmNlNjlmMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFuZHJvaWQiLCJhdXRoX3RpbWUiOjE2NTM2MzE4NzgsInNlc3Npb25fc3RhdGUiOiI5OGU0M2U4Ni0wMGJiLTQxZWYtODk0Yy00OGQyNzkyNWU1ZTYiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmFtZSI6IkFzZGYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc2RmX2RleGkiLCJnaXZlbl9uYW1lIjoiQXNkZiIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJhcyoqQHlvcG1haWwuY29tIn0.C4cTX5PURgONh4rWGIzrX_bocHm6pnFbd6kWN1LkCjb2hRLdDMhvik3uGyWZ1VcCfF4KE7ryDu1-v2U6b6ysgDP8zgrkN7EX406uYTkSWSKNiUtdM4aOs5MVSkqFRyAPZOeesbV8FzjaHPIdMRgh2aL0nGM6cvhv5WGR3JkReVaPCdUuyemkQ-L5i-EKY3mRr-YIb6ZfwjfLiyI3dx3KGY27ZF7Ge_GGeQnkXGLrWTwJsm6NIb_9bm5NST4KretscCMFx0A6_FKjvK_jeQg38F2mk2iP_nSljqqOY2h0SRU97r9eblE4KarZrSYWiVv62--XLLz4VXZ0zMpPxuuzGA',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            };
            mockWebviewRunner.success = jest.fn().mockImplementation(() => Promise.resolve(successStack.pop()));
            mockWebviewRunner.launchCustomTab = jest.fn().mockImplementation(() => Promise.resolve());
            // act
            nativeCustomBrowserSessionProvider.provide().then((session) => {
                // assert
                expect(session).toEqual({
                    access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJlYzMwNWNjOC1iZTZlLTRiM2YtODQ2Ni1lYmM4Y2Y0N2FiN2QiLCJleHAiOjE2NTM3MTgyNzgsIm5iZiI6MCwiaWF0IjoxNjUzNjMxOTg3LCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjIxNzY2YzQyLWNlMTItNGU2MC1iYzY0LTMwMzkyMmNlNjlmMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFuZHJvaWQiLCJhdXRoX3RpbWUiOjE2NTM2MzE4NzgsInNlc3Npb25fc3RhdGUiOiI5OGU0M2U4Ni0wMGJiLTQxZWYtODk0Yy00OGQyNzkyNWU1ZTYiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmFtZSI6IkFzZGYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc2RmX2RleGkiLCJnaXZlbl9uYW1lIjoiQXNkZiIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJhcyoqQHlvcG1haWwuY29tIn0.C4cTX5PURgONh4rWGIzrX_bocHm6pnFbd6kWN1LkCjb2hRLdDMhvik3uGyWZ1VcCfF4KE7ryDu1-v2U6b6ysgDP8zgrkN7EX406uYTkSWSKNiUtdM4aOs5MVSkqFRyAPZOeesbV8FzjaHPIdMRgh2aL0nGM6cvhv5WGR3JkReVaPCdUuyemkQ-L5i-EKY3mRr-YIb6ZfwjfLiyI3dx3KGY27ZF7Ge_GGeQnkXGLrWTwJsm6NIb_9bm5NST4KretscCMFx0A6_FKjvK_jeQg38F2mk2iP_nSljqqOY2h0SRU97r9eblE4KarZrSYWiVv62--XLLz4VXZ0zMpPxuuzGA',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                });
                expect(mockWebviewRunner.launchCustomTab).toHaveBeenCalledWith({host: "url_origin",
                    path: "some_pathname",
                    params: qs.parse("url_searchParams", {ignoreQueryPrefix: true}),
                    extraParams: 'extraParam'})
                return mockSession;
            });
        })
    });
})