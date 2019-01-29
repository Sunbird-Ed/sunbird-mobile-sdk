import { Authenticator } from '../../api/def/authenticator';
import { ApiConfig, Connection, Request, Response, ResponseInterceptor } from '../../api';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/def/api-service';
export declare class SessionAuthenticator implements Authenticator, ResponseInterceptor {
    private apiConfig;
    private apiService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    interceptRequest(request: Request): Request;
    onResponse(request: Request, response: Response, connection: Connection): Observable<Response>;
    private refreshToken;
}
