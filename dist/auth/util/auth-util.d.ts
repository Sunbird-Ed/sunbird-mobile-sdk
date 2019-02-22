import { ApiConfig, ApiService } from '../../api';
import { OauthSession } from '..';
export declare class AuthUtil {
    private apiConfig;
    private apiService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    refreshSession(): Promise<undefined>;
    startSession(sessionData: OauthSession): void;
    endSession(): Promise<undefined>;
    getSessionData(): Promise<OauthSession | undefined>;
    private hasExistingSession;
}
