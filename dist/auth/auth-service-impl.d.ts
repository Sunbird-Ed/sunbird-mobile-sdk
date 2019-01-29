import { AuthService } from './def/auth-service';
import { OauthSession } from './def/oauth-session';
import { ApiConfig } from '../api';
import { Observable } from 'rxjs';
import { ApiService } from '../api/def/api-service';
export declare class AuthServiceImpl implements AuthService {
    private apiConfig;
    private apiService;
    private authUtil;
    private oauthHandler;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    getSession(): Observable<OauthSession>;
    login(): Observable<OauthSession>;
    logout(): Observable<undefined>;
}
