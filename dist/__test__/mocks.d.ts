/// <reference types="jest" />
import { ApiService } from '../api';
import { ProfileServiceConfig } from '../profile/config/profile-service-config';
import { SessionAuthenticator } from '../auth';
import { CachedItemStore } from '../key-value-store';
import { ServerProfile } from '../profile/def/server-profile';
export declare type Mockify<T> = {
    [P in keyof T]: jest.Mock<{}>;
};
export declare const apiServiceMock: Mockify<ApiService>;
export declare const profileServiceConfigMock: ProfileServiceConfig;
export declare const sessionAuthenticatorMock: SessionAuthenticator;
export declare const cachedItemStoreMock: Mockify<CachedItemStore<ServerProfile>>;
