import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Authenticator } from '../def/authenticator';
import { Connection } from '../def/connection';
export declare class ApiAuthenticator implements Authenticator {
    private apiConfig;
    private connection;
    private apiTokenHandler;
    constructor(apiConfig: ApiConfig, connection: Connection);
    interceptRequest(request: Request): Request;
    interceptResponse(request: Request, response: Response): Observable<Response>;
}
