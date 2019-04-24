import { ApiConfig, ApiService } from '../../api';
import { SessionProvider } from '..';
export declare class SunbirdOAuthSessionProviderFactory {
    private apiConfig;
    private apiService;
    private inAppBrowserRef;
    constructor(apiConfig: ApiConfig, apiService: ApiService, inAppBrowserRef: InAppBrowserSession);
    fromUrl(url: string): SessionProvider | undefined;
    private isKeyCloakLogin;
    private isGoogleLogin;
    private isStateLogin;
}
