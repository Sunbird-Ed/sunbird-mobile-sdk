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
import {Observable} from 'rxjs';

jest.mock('../util/auth-util');

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

    const startSession = jest.fn(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        startSession
      }
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
    const getSessionData = jest.fn(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        getSessionData
      }
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
    const endSession = jest.fn(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        endSession
      }
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
    const refreshSession = jest.fn(() => Promise.resolve(undefined));
    (AuthUtil as jest.Mock<AuthUtil>).mockImplementation(() => {
      return {
        refreshSession
      }
    });
    const authService = container.get<AuthService>(InjectionTokens.AUTH_SERVICE);

    // act
    authService.refreshSession().subscribe(() => {
      // assert
      expect(refreshSession).toHaveBeenCalled();
      done();
    });
  });
});
