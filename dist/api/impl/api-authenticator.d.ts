import { Authenticator } from '../def/authenticator';
import { ApiConfig, Connection, Request, Response } from '..';
import { Observable } from 'rxjs';
export declare class ApiAuthenticator implements Authenticator {
    private apiConfig;
    private apiTokenHandler;
    constructor(apiConfig: ApiConfig);
    interceptRequest(request: Request): Request;
    onResponse(request: Request, response: Response, connection: Connection): Observable<Response>;
}
