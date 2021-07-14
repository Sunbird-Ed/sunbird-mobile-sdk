import { SessionProvider } from '../../../def/session-provider';
import { OAuthSession } from '../../../def/o-auth-session';
export interface NativeGoogleTokens {
    idToken: string;
    email: string;
}
export declare class NativeGoogleSessionProvider implements SessionProvider {
    private nativeGoogleTokenProvider;
    private static readonly LOGIN_API_ENDPOINT;
    private apiService;
    private static parseAccessToken;
    constructor(nativeGoogleTokenProvider: () => Promise<NativeGoogleTokens>);
    provide(): Promise<OAuthSession>;
    private callGoogleNativeLogin;
}
