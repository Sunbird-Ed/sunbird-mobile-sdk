import { ApiConfig, ApiService } from '../../api';
import { OAuthSession } from '..';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class AuthUtil {
    private apiConfig;
    private apiService;
    private sharedPreferences;
    constructor(apiConfig: ApiConfig, apiService: ApiService, sharedPreferences: SharedPreferences);
    refreshSession(): Promise<void>;
    startSession(sessionData: OAuthSession): Promise<void>;
    endSession(): Promise<void>;
    getSessionData(): Promise<OAuthSession | undefined>;
}
