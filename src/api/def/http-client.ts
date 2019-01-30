import {Response} from './response';
import {Observable} from 'rxjs';

export abstract class HttpClient {

    abstract addHeaders(headers: { [key: string]: string });

    abstract addHeader(key: string, value: string);

    abstract get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response>;

    abstract post(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;

    abstract patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response>;

}
