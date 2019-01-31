import { SessionProvider } from '../def/session-provider';
import { OauthSession } from '../def/oauth-session';
import { ApiConfig } from '../../api';
import { ApiService } from '../../api/def/api-service';
export declare class KeycloakSessionProvider implements SessionProvider {
    private apiConfig;
    private apiService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    createSession(accessToken: string): Promise<OauthSession>;
}
