import {ApiService} from '../api';
`import {ProfileServiceConfig, ServerProfile} from '../profile';
import {CachedItemStore} from '../key-value-store';
import {SessionAuthenticator} from '../util/authenticators/impl/session-authenticator';

export type Mockify<T> = {
    [P in keyof T]: jest.Mock<{}>;
  };

  const createSpyObj: <T extends {}>(methodNames: string[]) => Mockify<T> = (methodNames: string[]) => {
    const obj: any = {};
    for (let i = 0; i < methodNames.length; i++) {
      obj[methodNames[i]] = jest.fn(() => {
      });
    }
    return obj;
  };

export const apiServiceMock = createSpyObj<ApiService>([
   'fetch',
]);

export const profileServiceConfigMock = createSpyObj<ProfileServiceConfig>([

]) as any as ProfileServiceConfig;

export const sessionAuthenticatorMock = createSpyObj<SessionAuthenticator>([

]) as any as SessionAuthenticator;

export const cachedItemStoreMock = createSpyObj<CachedItemStore<ServerProfile>>([
  'getCached'
]);
