import { ApiConfig } from '../../api';
import { OauthSession } from '..';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/def/api-service';
export declare class OauthHandler {
    private apiService;
    private authUtil;
    constructor(apiService: ApiService);
    doLogin(apiConfig: ApiConfig): Observable<OauthSession>;
    doLogout(apiConfig: ApiConfig): Observable<undefined>;
    private isGoogleSignupCallBackUrl;
    private resolveTokens;
}
