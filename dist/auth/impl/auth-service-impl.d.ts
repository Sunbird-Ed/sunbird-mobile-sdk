import { AuthService, OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class AuthServiceImpl implements AuthService {
    private apiConfig;
    private apiService;
    private sharedPreferences;
    private authUtil;
    constructor(apiConfig: ApiConfig, apiService: ApiService, sharedPreferences: SharedPreferences);
    setSession(sessionProvider: SessionProvider): Observable<undefined>;
    getSession(): Observable<OAuthSession | undefined>;
    resignSession(): Observable<void>;
    refreshSession(): Observable<void>;
}
