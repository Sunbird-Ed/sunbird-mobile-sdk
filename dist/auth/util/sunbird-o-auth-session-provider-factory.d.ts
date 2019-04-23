import { ApiConfig, ApiService } from '../../api';
import { SessionProvider } from '..';
export declare class SunbirdOAuthSessionProviderFactory {
    private apiConfig;
    private apiService;
    private inAppBrowserRef;
    constructor(apiConfig: ApiConfig, apiService: ApiService, inAppBrowserRef: InAppBrowserSession);
    private static isKeyCloakLogin;
    private static isGoogleLogin;
    private static isStateLogin;
    fromUrl(url: string): SessionProvider | undefined;
}
