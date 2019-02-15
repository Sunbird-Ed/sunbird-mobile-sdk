import { ApiConfig, HttpClient, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Connection } from '../def/connection';
export declare class BaseConnection implements Connection {
    protected http: HttpClient;
    protected apiConfig: ApiConfig;
    constructor(http: HttpClient, apiConfig: ApiConfig);
    invoke(request: Request): Observable<Response>;
    protected addGlobalHeader(): void;
    private buildInterceptorsFromAuthenticators;
    private interceptRequest;
    private interceptResponse;
}
