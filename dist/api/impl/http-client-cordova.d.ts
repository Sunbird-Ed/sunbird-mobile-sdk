import { HttpClient, HttpSerializer, Response } from '..';
import { Observable } from 'rxjs';
export declare class HttpClientCordova implements HttpClient {
    private http;
    constructor();
    setSerializer(httpSerializer: HttpSerializer): void;
    addHeaders(headers: {
        [key: string]: string;
    }): void;
    addHeader(key: string, value: string): void;
    get(baseUrl: string, path: string, headers: any, parameters: {
        [key: string]: string;
    }): Observable<Response>;
    patch(baseUrl: string, path: string, headers: any, body: {}): Observable<Response>;
    post(baseUrl: string, path: string, headers: any, body: {}): Observable<Response>;
    private invokeRequest;
}
