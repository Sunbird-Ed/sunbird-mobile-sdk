import { Response } from './response';
import { Observable } from 'rxjs';
import { HttpSerializer } from './request';
export declare abstract class HttpClient {
    abstract setSerializer(httpSerializer: HttpSerializer): any;
    abstract addHeaders(headers: {
        [key: string]: string;
    }): any;
    abstract addHeader(key: string, value: string): any;
    abstract get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response>;
    abstract post(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
    abstract patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;
}
