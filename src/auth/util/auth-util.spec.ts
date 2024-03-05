import {AuthUtil} from './auth-util';
import {ApiConfig, ApiService, HttpClientError, Response, ResponseCode} from '../../api';
import {anyString, anything, instance, objectContaining, reset, verify, when} from 'ts-mockito';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {MockApiService, MockEventsBusService, MockSharedPreferences} from '../../__test__/mocks';
import {OAuthSession} from '..';
import {of, throwError} from 'rxjs';
import {AuthKeys} from '../../preference-keys';
import {NoActiveSessionError} from '../../profile';
import {AuthTokenRefreshError} from '../errors/auth-token-refresh-error';
import { JwtUtil } from '../../util/jwt-util';

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
        updateConfig: jest.fn().mockImplementation(() => {
        })
      }
    }
  };
});

describe('AuthUtil', () => {
  beforeEach(() => {
    reset(MockApiService);
    reset(MockSharedPreferences);
    reset(MockEventsBusService);
    jest.resetAllMocks();
  });

  it('should be able to create an instance', () => {
    // arrange
    const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;
    const mockApiService: ApiService = instance(MockApiService);
    const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
    const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

    // act
    const authUtil = new AuthUtil(
      mockApConfig,
      mockApiService,
      mockSharedPreferences,
      mockEventsBusService
    );

    // assert
    expect(authUtil).toBeTruthy();
  });

  describe('startSession()', () => {
    it('should save sessionData to sharedPreferences', (done) => {
      // arrange
      window['device'] = {uuid: 'some_uuid', platform:'android'};
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);

      when(MockSharedPreferences.putString(anyString(), anyString())).thenReturn(of(undefined));

      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      const sessionData: OAuthSession = {
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      };

      // act
      authUtil.startSession(sessionData).then(() => {
        verify(MockSharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData))).called();
        done();
      });
    });
  });

  describe('getSessionData()', () => {
    it('should return sessionData from sharedPreferences if exists', (done) => {
      // arrange
      const sessionData: OAuthSession = {
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      };

      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);

      when(MockSharedPreferences.getString(anyString())).thenReturn(of(JSON.stringify(sessionData)));

      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      // act
      authUtil.getSessionData().then((returnedSessionData) => {
        expect(returnedSessionData).toEqual(sessionData);
        verify(MockSharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION)).called();
        done();
      });
    });

    it('should return undefiend from sharedPreferences if not exists', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);

      when(MockSharedPreferences.getString(anyString())).thenReturn(of(undefined));

      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      // act
      authUtil.getSessionData().then((returnedSessionData) => {
        expect(returnedSessionData).toEqual(undefined);
        verify(MockSharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION)).called();
        done();
      });
    });
  });

  describe('endSession()', () => {
    it('should reject if InAppBrowser closed without expected callback', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {
        host: 'SAMPLE_HOST',
        user_authentication: {
          authUrl: 'SAMPLE_AUTH_URL'
        }
      } as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      spyOn(window['cordova'].InAppBrowser, 'open').and.returnValue(
        {
          addEventListener: (event: string, cb) => {
            if (event === 'exit') {
              setTimeout(() => {
                cb();
              });
            }
          }
        }
      );

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      authUtil.endSession().catch(() => {
        done();
      });
    });

    it('should reset sharedPreferences if InAppBrowser closes with expected callback', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {
        host: 'SAMPLE_HOST',
        user_authentication: {
          authUrl: 'SAMPLE_AUTH_URL'
        }
      } as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);
      when(MockSharedPreferences.putString(anyString(), anyString())).thenReturn(of(undefined));
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      spyOn(window['cordova'].InAppBrowser, 'open').and.returnValue(
        {
          removeEventListener: () => {},
          close: () => {},
          addEventListener: (event: string, cb) => {
            if (event === 'loadstart') {
              setTimeout(() => {
                cb({
                  url: 'SAMPLE_URL/oauth2callback'
                });
              });
            }
          }
        }
      );

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      authUtil.endSession().then(() => {
        verify(MockSharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, '')).called();
        done();
      });
    });
  });

  describe('refreshSession()', () => {
    it('should reject if there is no active session to refresh', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;
      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      spyOn(authUtil, 'getSessionData').and.returnValue(Promise.resolve(undefined));

      // act
      authUtil.refreshSession().catch((e) => {
        // assert
        expect(e instanceof NoActiveSessionError).toBeTruthy();
        done();
      });
    });

    it('should reject if refresh token API fails', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;

      when(MockApiService.fetch(anything())).thenReturn(throwError('SAMPLE_ERROR'));

      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      spyOn(authUtil, 'getSessionData').and.returnValue(Promise.resolve({
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      }));

      // act
      authUtil.refreshSession().catch((e) => {
        expect(e).toEqual('SAMPLE_ERROR');
        done();
      });
    });

    it('should reject and emit event if refresh token API fails with ServerError BAD_REQUEST', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;

      const badRequestError = new HttpClientError('', (() => {
        const res = new Response();
        res.responseCode = ResponseCode.HTTP_BAD_REQUEST;
        return res;
      })());
      when(MockApiService.fetch(anything())).thenReturn(throwError(badRequestError));

      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      spyOn(authUtil, 'getSessionData').and.returnValue(Promise.resolve({
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      }));

      // act
      authUtil.refreshSession().catch((e) => {
        verify(MockEventsBusService.emit(objectContaining({
          namespace: EventNamespace.ERROR
        }))).called();
        expect(e instanceof AuthTokenRefreshError).toBeTruthy();
        done();
      });
    });

    it('should reject and emit event if refresh token API succeeds with bad data', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;

      const response = new Response();
      response.body = {
        result: {}
      };
      response.responseCode = ResponseCode.HTTP_SUCCESS;

      when(MockApiService.fetch(anything())).thenReturn(of(response));

      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      const authUtil = new AuthUtil(
        mockApConfig,
        mockApiService,
        mockSharedPreferences,
        mockEventsBusService
      );

      spyOn(authUtil, 'getSessionData').and.returnValue(Promise.resolve({
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      }));

      // act
      authUtil.refreshSession().catch((e) => {
        verify(MockEventsBusService.emit(objectContaining({
          namespace: EventNamespace.ERROR
        }))).called();
        expect(e instanceof AuthTokenRefreshError).toBeTruthy();
        done();
      });
    });

    it('should save sessionData to sharedPreferences if refresh token API succeeds', (done) => {
      // arrange
      const mockApConfig: ApiConfig = {} as Partial<ApiConfig> as ApiConfig;

      const response = new Response();
      response.body = {
        result: {
          access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ1WXhXdE4tZzRfMld5MG5PS1ZoaE5hU0gtM2lSSjdXU25ibFlwVVU0TFRrIn0.eyJqdGkiOiJmMDZiMWFlZC1hODNkLTQ1NWQtODFjMS1kODExNTZiZGJjYzMiLCJleHAiOjE1MjE2OTY2OTMsIm5iZiI6MCwiaWF0IjoxNTIxNjk2MDkzLCJpc3MiOiJodHRwczovL2Rldi5vcGVuLXN1bmJpcmQub3JnL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhZG1pbi1jbGkiLCJzdWIiOiI3ODFjMjFmYy01MDU0LTRlZTAtOWEwMi1mYmIxMDA2YTRmZGQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJiOGNhNTM4Zi02NGRhLTQzYmYtOTYwMC0xNTk1MDU5OWY0NTciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbXSwicmVzb3VyY2VfYWNjZXNzIjp7fSwibmFtZSI6ImFkbWluIG9yZyIsInByZWZlcnJlZF91c2VybmFtZSI6Im9yZ19hZG1pbiIsImdpdmVuX25hbWUiOiJhZG1pbiIsImZhbWlseV9uYW1lIjoib3JnIn0.XVw_NFBCO6_OMzozlWv9ecwEvjJNtuvS5RJ_o9Bky6rs80D09VtPUsU2s9X2-ZLQae48o5s2_yzRizpMEcY5Bku-ARUEDMriB806DKtf0NNm4J_50CScgV3dnd9ZBdUzcJBxpYlMFqOH2QpzYQ7x0j-3wcakj9wKYb5D7AF_fbMQj33VqgFNEY-fO3jyXqLtZ9PTjTxjgwXUT6kmMoiHqBTdmk3JZLKb4mC53sCnrZ6Zq3OHQXgk23-DLR-asowF5DUkKD38zHPp3lqMMXXLovYxPI7igDd9S7oXJSYRtyFemfZUyWTJceEHINmD_x_iyT3PIEnK0bZkZjUFkey9iw',
          refresh_token: 'SAMPLE_REFRESH_TOKEN',
          userToken: 'SAMPLE_USER_TOKEN'
        }
      };
      response.responseCode = ResponseCode.HTTP_SUCCESS;

      when(MockApiService.fetch(anything())).thenReturn(of(response));
      when(MockSharedPreferences.putString(anyString(), anyString())).thenReturn(of(undefined));

      const mockApiService: ApiService = instance(MockApiService);
      const mockSharedPreferences: SharedPreferences = instance(MockSharedPreferences);
      const mockEventsBusService: EventsBusService = instance(MockEventsBusService);

      spyOn(mockSharedPreferences, 'putString').and.callThrough();

      const authUtil = new AuthUtil(
          mockApConfig,
          mockApiService,
          mockSharedPreferences,
          mockEventsBusService
      );

      spyOn(authUtil, 'startSession').and.stub();

      spyOn(authUtil, 'getSessionData').and.returnValue(Promise.resolve({
        access_token: 'SAMPLE_ACCESS_TOKEN',
        refresh_token: 'SAMPLE_REFRESH_TOKEN',
        userToken: 'SAMPLE_USER_TOKEN'
      }));
      jest.spyOn(JwtUtil, 'decodeJWT').mockImplementation(() => Promise.resolve(`{ "iss": "https://staging.sunbirded.org/auth/realms/sunbird",
      "exp": 1711023727,
      "sub": "f:979738b7-253c-4adf-9673-a857eeb86115:372504c7-838a-433c-a24d-f8ac0ed5c480"}`));
      // act
      authUtil.refreshSession().then(() => {
        expect(mockSharedPreferences.putString).toHaveBeenCalledWith(AuthKeys.KEY_OAUTH_SESSION, expect.any(String));
        done();
      });
    });
  });
});
