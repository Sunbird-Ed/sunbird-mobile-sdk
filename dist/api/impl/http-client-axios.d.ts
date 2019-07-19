import { HttpClient, HttpSerializer, Response } from '..';
import { Observable } from 'rxjs';
export declare class HttpClientAxios implements HttpClient {
    private headers;
    private axios;
    private serializer?;
    constructor();
    setSerializer(httpSerializer: HttpSerializer): void;
    addHeader(key: string, value: string): void;
    addHeaders(headers: {
        [p: string]: string;
    }): void;
    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response>;
    patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
    post(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
    private handleResponse;
}
