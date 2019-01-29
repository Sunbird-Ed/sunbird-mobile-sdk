import { HttpClient, Response } from '..';
import { Observable } from 'rxjs';
export declare class HttpClientImpl implements HttpClient {
    private http;
    constructor();
    addHeaders(headers: any): void;
    addHeader(key: string, value: string): void;
    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response>;
    patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
    post(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
    private invokeRequest;
}
