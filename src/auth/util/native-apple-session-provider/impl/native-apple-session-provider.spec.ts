import { CsModule } from '@project-sunbird/client-services';
import { of } from 'rxjs';
import { ApiService, SunbirdSdk } from '../../../..';
import { NativeAppleSessionProvider } from './native-apple-session-provider';
import { JwtUtil } from '../../../../util/jwt-util';

export interface NativeAppleTokens {
    email: string;
    authorizationCode: string;
    state: string;
    identityToken: string;
    fullName: {
        nickname: string;
        phoneticRepresentation: string;
        middleName: string
        familyName: string;
        namePrefix: string;
        givenName: string;
        nameSuffix: string;
    };
    user: string;
}

const mockSunbirdSdk: Partial<SunbirdSdk> = {};
SunbirdSdk['_instance'] = mockSunbirdSdk as SunbirdSdk;
describe('NativeAppleSessionProvider', () => {
    let nativeAppleSessionProvider: NativeAppleSessionProvider;
    let mocknativeAppleTokenProvider: Partial<Promise<NativeAppleTokens>> = {};
    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        (mockSunbirdSdk as any)['apiService'] = mockApiService as ApiService;
        nativeAppleSessionProvider = new NativeAppleSessionProvider(
            mocknativeAppleTokenProvider = jest.fn(() => Promise.resolve({ email: 'sample@abc.com' })) as any
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        window['device'] = { uuid: 'some_uuid', platform: 'ios' };
    });

    it('should create a instanc of NativeAppleSessionProvider', () => {
        expect(nativeAppleSessionProvider).toBeTruthy();
    });

    describe('provide', () => {
        beforeEach(() => {
            jest.spyOn(CsModule.instance, 'updateAuthTokenConfig').mockImplementation(() => {
                return;
            });
        });
        it('should return server response for apple login', (done) => {
            const mockSession = {
                body: {
                    sessionId: {
                        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJlYzMwNWNjOC1iZTZlLTRiM2YtODQ2Ni1lYmM4Y2Y0N2FiN2QiLCJleHAiOjE2NTM3MTgyNzgsIm5iZiI6MCwiaWF0IjoxNjUzNjMxOTg3LCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjIxNzY2YzQyLWNlMTItNGU2MC1iYzY0LTMwMzkyMmNlNjlmMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFuZHJvaWQiLCJhdXRoX3RpbWUiOjE2NTM2MzE4NzgsInNlc3Npb25fc3RhdGUiOiI5OGU0M2U4Ni0wMGJiLTQxZWYtODk0Yy00OGQyNzkyNWU1ZTYiLCJhY3IiOiIxIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwibmFtZSI6IkFzZGYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc2RmX2RleGkiLCJnaXZlbl9uYW1lIjoiQXNkZiIsImZhbWlseV9uYW1lIjoiIiwiZW1haWwiOiJhcyoqQHlvcG1haWwuY29tIn0.C4cTX5PURgONh4rWGIzrX_bocHm6pnFbd6kWN1LkCjb2hRLdDMhvik3uGyWZ1VcCfF4KE7ryDu1-v2U6b6ysgDP8zgrkN7EX406uYTkSWSKNiUtdM4aOs5MVSkqFRyAPZOeesbV8FzjaHPIdMRgh2aL0nGM6cvhv5WGR3JkReVaPCdUuyemkQ-L5i-EKY3mRr-YIb6ZfwjfLiyI3dx3KGY27ZF7Ge_GGeQnkXGLrWTwJsm6NIb_9bm5NST4KretscCMFx0A6_FKjvK_jeQg38F2mk2iP_nSljqqOY2h0SRU97r9eblE4KarZrSYWiVv62--XLLz4VXZ0zMpPxuuzGA',
                        refresh_token: 'SOME_REFRESH_TOKEN',
                        userToken: 'SOME_USER_TOKEN'
                    }
                }
            };
            mockApiService.fetch = jest.fn(() => of(mockSession) as any);
            jest.spyOn(JwtUtil, 'decodeJWT').mockImplementation(() => Promise.resolve(`{ "iss": "https://staging.sunbirded.org/auth/realms/sunbird",
            "exp": 1711023727,
            "sub": "f:979738b7-253c-4adf-9673-a857eeb86115:372504c7-838a-433c-a24d-f8ac0ed5c480"}`));
            nativeAppleSessionProvider.provide().then(() => {
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            });
        });
    });
});
