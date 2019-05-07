import { ApiConfig, ApiService } from '../../api';
import { OAuthSession } from '..';
import { SharedPreferences } from '../../util/shared-preferences';
import { EventsBusService } from '../../events-bus';
export declare class AuthUtil {
    private apiConfig;
    private apiService;
    private sharedPreferences;
    private eventsBusService;
    constructor(apiConfig: ApiConfig, apiService: ApiService, sharedPreferences: SharedPreferences, eventsBusService: EventsBusService);
    refreshSession(): Promise<void>;
    startSession(sessionData: OAuthSession): Promise<void>;
    endSession(): Promise<void>;
    getSessionData(): Promise<OAuthSession | undefined>;
}
