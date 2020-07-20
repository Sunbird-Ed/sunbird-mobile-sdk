import {Container} from 'inversify';
import {AuthService, OAuthSession, SessionProvider} from '..';
import {SdkConfig} from '../../sdk-config';
import {ApiService} from '../../api';
import {instance, mock, when} from 'ts-mockito';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';
import {InjectionTokens} from '../../injection-tokens';
import {AuthServiceImpl} from './auth-service-impl';
import {AuthUtil} from '../util/auth-util';
import {EMPTY, of} from 'rxjs';
import {CsModule} from '@project-sunbird/client-services';
import {AuthKeys, ProfileKeys} from '../../preference-keys';
import {ProfileSession} from '../../profile';

jest.mock('../util/auth-util');
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

describe('AuthServiceImpl', () => {
  let authService: AuthService;
  const container: Container = new Container();
  const mockSdkConfig: SdkConfig = {} as Partial<SdkConfig> as SdkConfig;
  const mockApiService: ApiService = instance(mock<ApiService>());
  const mockSharedPreferences: SharedPreferences = instance(mock<SharedPreferences>());
  const mockEventsBusService: EventsBusService = instance(mock<EventsBusService>());

  beforeAll(() => {
    container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig);
    container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService);
    container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences);
    container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).toConstantValue(mockEventsBusService);
    container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).to(AuthServiceImpl);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should register an instance of AuthServiceImpl in IoC container', () => {
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    expect(authService).toBeTruthy();
  });

  it('should call AuthUtil.startSession() on sessionProvider resolve of setSession()', (done) => {
    // arrange
    const MockSessionProvider = mock<SessionProvider>();
    when(MockSessionProvider.provide()).thenResolve({
      access_token: 'SAMPLE_ACCESS_TOKEN',
      refresh_token: 'SAMPLE_REFRESH_TOKEN',
      userToken: 'SAMPLE_USER_TOKEN'
    });
    const mockSessionProvider = instance(MockSessionProvider);

    const startSession = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        startSession
      } as Partial<AuthUtil> as AuthUtil;
    });
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    // act
    authService.setSession(mockSessionProvider).subscribe(() => {
      // assert
      expect(startSession).toHaveBeenCalled();
      done();
    });
  });

  it('should delegate getSession() to AuthUtil.getSessionData()', (done) => {
    // arrange
    const getSessionData = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        getSessionData
      } as Partial<AuthUtil> as AuthUtil;
    });
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    // act
    authService.getSession().subscribe(() => {
      // assert
      expect(getSessionData).toHaveBeenCalled();
      done();
    });
  });

  it('should delegate resignSession() to AuthUtil.endSession()', (done) => {
    // arrange
    const endSession = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        endSession
      } as Partial<AuthUtil> as AuthUtil;
    });
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    // act
    authService.resignSession().subscribe(() => {
      // assert
      expect(endSession).toHaveBeenCalled();
      done();
    });
  });

  it('should delegate refreshSession() to AuthUtil.refreshSession()', (done) => {
    // arrange
    const refreshSession = jest.fn().mockImplementation(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        refreshSession
      } as Partial<AuthUtil> as AuthUtil;
    });
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    // act
    authService.refreshSession().subscribe(() => {
      // assert
      expect(refreshSession).toHaveBeenCalled();
      done();
    });
  });

  describe('onInit', () => {
    describe('should setup sharePreferences listener to update CsModule tokens when OAuthSession changes', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      it('should also add/update managedUserToken when managed profileSession present', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid', managedSession: {uid: 'some_managed_uid'}};
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            return of(JSON.stringify(mockProfileSession as ProfileSession));
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            listener(JSON.stringify(mockAuthSession)).then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: 'some_token',
                      managedUserToken: 'some_managed_token'
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });

      it('should also remove managedUserToken when managed ProfileSession not present', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid'};
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            return of(JSON.stringify(mockProfileSession as ProfileSession));
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            listener(JSON.stringify(mockAuthSession)).then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: 'some_token',
                      managedUserToken: undefined
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });

      it('should remove both userToken and managedUserToken when userToken is removed', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockProfileSession = {uid: 'some_uid'};
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            return of(JSON.stringify(mockProfileSession as ProfileSession));
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            listener('').then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: undefined,
                      managedUserToken: undefined
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });
    });

    describe('should setup sharePreferences listener to update CsModule tokens when ProfileSession changes', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      it('should also add/update managedUserToken when managed profileSession present', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid', managedSession: {uid: 'some_managed_uid'}};
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            return of(JSON.stringify(mockAuthSession as OAuthSession));
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            listener(JSON.stringify(mockProfileSession)).then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: 'some_token',
                      managedUserToken: 'some_managed_token'
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });

      it('should also remove managedUserToken when managed ProfileSession not present', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid'};
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            return of(JSON.stringify(mockAuthSession as OAuthSession));
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            listener(JSON.stringify(mockProfileSession)).then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: 'some_token',
                      managedUserToken: undefined
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });

      it('should remove both userToken and managedUserToken when userToken is removed', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        mockSharedPreferences.getString = jest.fn().mockImplementation((key) => {
          if (key === AuthKeys.KEY_OAUTH_SESSION) {
            return of('');
          }
        });
        mockSharedPreferences.addListener = jest.fn().mockImplementation((key, listener) => {
          if (key === ProfileKeys.KEY_USER_SESSION) {
            listener('').then(() => {
              expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
                core: {
                  api: {
                    authentication: {
                      userToken: undefined,
                      managedUserToken: undefined
                    }
                  }
                }
              }));
              done();
            });
          }
        });
        spyOn(authService, 'getSession').and.returnValue(EMPTY);

        // act
        authService.onInit().subscribe();
      });
    });

    describe('should initialize client-services with tokens from sharedPreferences', () => {
      it('should also add managedUserToken when managed profileSession present', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid', managedSession: {uid: 'some_managed_uid'}};
        mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
        });
        spyOn(authService, 'getSession').and.returnValue(of(mockAuthSession));
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify(mockProfileSession)));

        // act
        authService.onInit().subscribe(() => {
          // assert
          expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
            core: {
              api: {
                authentication: {
                  userToken: 'some_token',
                  managedUserToken: 'some_managed_token'
                }
              }
            }
          }));
          done();
        });
      });

      it('should also not set managedUserToken when managed profileSession missing', (done) => {
        // arrange
        const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
        const mockAuthSession = {access_token: 'some_token', managed_access_token: 'some_managed_token'};
        const mockProfileSession = {uid: 'some_uid'};
        mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
        });
        spyOn(authService, 'getSession').and.returnValue(of(mockAuthSession));
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify(mockProfileSession)));

        // act
        authService.onInit().subscribe(() => {
          // assert
          expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(expect.objectContaining({
            core: {
              api: {
                authentication: {
                  userToken: 'some_token',
                  managedUserToken: undefined
                }
              }
            }
          }));
          done();
        });
      });
    });
  });
});
