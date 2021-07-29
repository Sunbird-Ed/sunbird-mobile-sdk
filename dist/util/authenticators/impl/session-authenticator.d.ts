import { ApiConfig, ApiService, Request, RequestInterceptor, Response, ResponseInterceptor } from '../../../api';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth';
import { SharedPreferences } from '../../shared-preferences';
export declare class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {
    private sharedPreferences;
    private apiConfig;
    private apiService;
    private authService;
    constructor(sharedPreferences: SharedPreferences, apiConfig: ApiConfig, apiService: ApiService, authService: AuthService);
    interceptRequest(request: Request): Observable<Request>;
    interceptResponse(request: Request, response: Response): Observable<Response>;
    private invokeRefreshSessionTokenApi;
}
