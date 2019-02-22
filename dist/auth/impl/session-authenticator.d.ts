import { ApiConfig, Request, RequestInterceptor, Response, ResponseInterceptor } from '../../api';
import { Observable } from 'rxjs';
import { Connection } from '../../api/def/connection';
export declare class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {
    private apiConfig;
    private connection;
    constructor(apiConfig: ApiConfig, connection: Connection);
    interceptRequest(request: Request): Request;
    interceptResponse(request: Request, response: Response): Observable<Response>;
    private invokeRefreshSessionTokenApi;
    private startSession;
}
