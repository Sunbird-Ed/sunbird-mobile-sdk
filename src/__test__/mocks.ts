import {ApiService} from '../api';
import {ProfileServiceConfig} from '../profile/config/profile-service-config';
import {SessionAuthenticator} from '../auth';
import {CachedItemStore} from '../key-value-store';
import {ServerProfile} from '../profile/def/server-profile';

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
