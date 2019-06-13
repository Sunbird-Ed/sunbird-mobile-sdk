/// <reference types="jest" />
import { ApiService } from '../api';
import { ProfileServiceConfig } from '../profile';
import { CachedItemStore } from '../key-value-store';
import { SessionAuthenticator } from '../util/authenticators/impl/session-authenticator';
export declare type Mockify<T> = {
    [P in keyof T]: jest.Mock<{}>;
};
export declare const apiServiceMock: Mockify<ApiService>;
export declare const profileServiceConfigMock: ProfileServiceConfig;
export declare const sessionAuthenticatorMock: SessionAuthenticator;
export declare const cachedItemStoreMock: Mockify<CachedItemStore>;
