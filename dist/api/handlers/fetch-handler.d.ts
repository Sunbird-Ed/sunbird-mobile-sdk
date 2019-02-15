import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
export declare class FetchHandler {
    private request;
    private apiConfig;
    private baseConnection;
    constructor(request: Request, apiConfig: ApiConfig);
    doFetch(): Observable<Response>;
}
