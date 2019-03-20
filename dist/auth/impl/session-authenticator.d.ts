import { ApiConfig, Request, RequestInterceptor, Response, ResponseInterceptor } from '../../api';
import { Observable } from 'rxjs';
import { Connection } from '../../api/def/connection';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {
    private sharedPreferences;
    private apiConfig;
    private connection;
    constructor(sharedPreferences: SharedPreferences, apiConfig: ApiConfig, connection: Connection);
    interceptRequest(request: Request): Observable<Request>;
    interceptResponse(request: Request, response: Response): Observable<Response>;
    private invokeRefreshSessionTokenApi;
    private startSession;
}
