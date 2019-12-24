import { HttpClient, HttpSerializer, Response as SunbirdApiResponse } from '..';
import { Observable } from 'rxjs';
export declare class HttpClientBrowser implements HttpClient {
    private headers;
    private serializer?;
    private static mapError;
    private static mapResponse;
    constructor();
    setSerializer(httpSerializer: HttpSerializer): void;
    addHeader(key: string, value: string): void;
    addHeaders(headers: {
        [p: string]: string;
    }): void;
    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<SunbirdApiResponse>;
    patch(baseUrl: string, path: string, headers: any, body: any): Observable<SunbirdApiResponse>;
    post(baseUrl: string, path: string, headers: any, body: any): Observable<SunbirdApiResponse>;
}
