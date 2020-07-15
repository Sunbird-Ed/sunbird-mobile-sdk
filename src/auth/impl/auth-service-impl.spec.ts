import {Container} from 'inversify';
import {AuthService, SessionProvider} from '..';
import {SdkConfig} from '../../sdk-config';
import {ApiService} from '../../api';
import {instance, mock, when} from 'ts-mockito';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';
import {InjectionTokens} from '../../injection-tokens';
import {AuthServiceImpl} from './auth-service-impl';
import {AuthUtil} from '../util/auth-util';
import {of} from 'rxjs';
import {CsModule} from '@project-sunbird/client-services';

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
    it('should setup sharePreference listener to update CsModule user token when changed', (done) => {
      // arrange
      const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
      mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({access_token: 'some_token'})));
      mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
        listener(JSON.stringify({access_token: 'some_token'}));
      });
      spyOn(authService, 'getSession').and.returnValue(of(undefined));

      // act
      authService.onInit().subscribe(() => {
        // assert
        expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(CsModule.instance.config);
        done();
      });
    });

    it('should setup sharePreference listener to update CsModule user token when removed', (done) => {
      // arrange
      const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
      mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({access_token: 'some_token'})));
      mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
        listener('');
      });
      spyOn(authService, 'getSession').and.returnValue(of(undefined));

      // act
      authService.onInit().subscribe(() => {
        // assert
        expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(CsModule.instance.config);
        done();
      });
    });

    it('should update CsModule userToken if set in sharedPreferences', (done) => {
      // arrange
      const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
      mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({access_token: 'some_token'})));
      mockSharedPreferences.addListener = jest.fn().mockImplementation((_, listener) => {
        listener('');
      });
      spyOn(authService, 'getSession').and.returnValue(of({access_token: 'some_token'}));

      // act
      authService.onInit().subscribe(() => {
        // assert
        expect(CsModule.instance.updateConfig).toHaveBeenCalledWith(CsModule.instance.config);
        done();
      });
    });
  });
});
