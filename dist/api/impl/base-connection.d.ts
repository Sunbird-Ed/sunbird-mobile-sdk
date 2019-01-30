import { ApiConfig, Connection, HttpClient, Request, Response } from '..';
import { Observable } from 'rxjs';
export declare class BaseConnection implements Connection {
    protected http: HttpClient;
    protected apiConfig: ApiConfig;
    constructor(http: HttpClient, apiConfig: ApiConfig);
    private static interceptRequest;
    protected addGlobalHeader(): void;
    invoke(request: Request): Observable<Response>;
    private interceptResponse;
}
