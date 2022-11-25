import {SunbirdSdk} from '../../../../sdk';
import {ApiService, HttpRequestType, Request} from '../../../../api';
import { NativeKeycloakSessionProvider, NativeKeycloakTokens } from './native-keycloak-session-provider';
import { WebviewSessionProviderConfig } from '../../webview-session-provider/def/webview-session-provider-config';
import { of } from 'rxjs';
import {CsModule} from '@project-sunbird/client-services';
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

const mockSunbirdSdk: Partial<SunbirdSdk> = {};
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;

describe('NativeKeycloakSessionProvider', () => {
    const mockApiService: Partial<ApiService> = {};
    const nativeKeyclaokToken: Partial<NativeKeycloakTokens> = {};
    let nativeKeycloakSessionProvider: NativeKeycloakSessionProvider;

    beforeAll(() => {
        (mockSunbirdSdk as any)['apiService'] = mockApiService as ApiService;
        (mockSunbirdSdk as any)['sdkConfig'] = {apiConfig: {}};

        nativeKeycloakSessionProvider = new NativeKeycloakSessionProvider(
            mockManualLoginConfig,
            nativeKeyclaokToken as NativeKeycloakTokens
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(nativeKeycloakSessionProvider).toBeTruthy();
    });

    describe('provide()', () => {
        it('should pass all login details on api call with sucess access token', () => {
            window['device'] = {
                uuid:'some_id',
                platform: 'android'
            }
            const mockSession = { body: {
                access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJlYzMwNWNjOC1iZTZlLTRiM2YtODQ2Ni1lYmM4Y2Y0N2FiN2QiLCJleHAiOjE2NTM3MTgyNzgsIm5iZiI6MCwiaWF0IjoxNjUzNjMxOTg3LCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjIxNzY2YzQyLWNlMTItNGU2MC1iYzY0LTMwMzkyMmNlNjlmMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFuZHJvaWQiLCJhdXRoX3RpbWUiOjE2NTM2MzE4NzgsInNlc3Npb25fc3RhdGUiOiI5OGU0M2U4Ni0wMGJiLTQxZWYtODk0Yy00OGQyNzkyNWU1ZTYiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmFtZSI6IkFzZGYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc2RmX2RleGkiLCJnaXZlbl9uYW1lIjoiQXNkZiIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJhcyoqQHlvcG1haWwuY29tIn0.C4cTX5PURgONh4rWGIzrX_bocHm6pnFbd6kWN1LkCjb2hRLdDMhvik3uGyWZ1VcCfF4KE7ryDu1-v2U6b6ysgDP8zgrkN7EX406uYTkSWSKNiUtdM4aOs5MVSkqFRyAPZOeesbV8FzjaHPIdMRgh2aL0nGM6cvhv5WGR3JkReVaPCdUuyemkQ-L5i-EKY3mRr-YIb6ZfwjfLiyI3dx3KGY27ZF7Ge_GGeQnkXGLrWTwJsm6NIb_9bm5NST4KretscCMFx0A6_FKjvK_jeQg38F2mk2iP_nSljqqOY2h0SRU97r9eblE4KarZrSYWiVv62--XLLz4VXZ0zMpPxuuzGA',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }};
            mockManualLoginConfig.return = [];
            const request = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath('/keycloak/login')
                    .withBody({
                        client_id: "android",
                        loginConfig: mockManualLoginConfig.target
                    })
                    .build();
            mockApiService.fetch = jest.fn().mockImplementation(() => of(mockSession));
            nativeKeycloakSessionProvider.provide().then(() => {
                expect(mockApiService.fetch).toHaveBeenCalledWith(request);
                expect(CsModule.instance.updateAuthTokenConfig).toHaveBeenCalledWith(mockSession.body.access_token);
                return mockSession.body;
            });
        });
        it('should pass all login details on api call with success and validate err', () => {
            window['device'] = {
                uuid:'some_id',
                platform: 'android'
            }
            const mockSession = { body: {
                err: {error_msg: "validation error"}
            }};
            mockManualLoginConfig.return = [];
            const request = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath('/keycloak/login')
                    .withBody({
                        client_id: "android",
                        loginConfig: mockManualLoginConfig.target
                    })
                    .build();
            mockApiService.fetch = jest.fn().mockImplementation(() => of(mockSession));
            nativeKeycloakSessionProvider.provide().then(() => {
                expect(mockApiService.fetch).toHaveBeenCalledWith(request);
            });
        });
    });
});
