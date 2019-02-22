import { AuthService, OauthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { Observable } from 'rxjs';
export declare class AuthServiceImpl implements AuthService {
    private apiConfig;
    private apiService;
    private authUtil;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    setSession(sessionProvider: SessionProvider): Observable<undefined>;
    getSession(): Observable<OauthSession | undefined>;
    resignSession(): Observable<undefined>;
    refreshSession(): Observable<undefined>;
}
