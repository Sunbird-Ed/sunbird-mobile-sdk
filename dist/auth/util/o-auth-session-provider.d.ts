import { OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
export declare class OAuthSessionProvider implements SessionProvider {
    private apiConfig;
    private apiService;
    private oAuthService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    provide(): Promise<OAuthSession>;
}
