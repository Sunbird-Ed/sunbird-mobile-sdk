import {HttpClient} from '../def/http-client';
import {Response} from '../def/response';
import {HttpRequestType} from '../def/request';
import {Observable, Subject} from 'rxjs';

interface HttpResponse {
    status: number;
    headers: any;
    url: string;
    data?: any;
    error?: string;
}

declare var cordova: {
    plugin: {
        http: {
            setHeader: (hostname: string, header: string, value: string) => void;
            get: (url: string, parameters: any, headers: { [key: string]: string },
                  successCallback: (response: HttpResponse) => void,
                  errorCallback: (response: HttpResponse) => void) => void;
            patch: (url: string, data: any, headers: { [key: string]: string },
                    successCallback: (response: HttpResponse) => void,
                    errorCallback: (response: HttpResponse) => void) => void;
            post: (url: string, data: any, headers: { [key: string]: string },
                   successCallback: (response: HttpResponse) => void,
                   errorCallback: (response: HttpResponse) => void) => void;
        }
    }
};

export class HttpClientImpl implements HttpClient {

    private http = cordova.plugin.http;

    constructor() {
    }

    addHeaders(headers: any) {
        for (const key in headers) {
            if (headers.hasOwnProperty(key)) {
                this.http.setHeader('*', key, headers[key]);
            }
        }
    }

    addHeader(key: string, value: string) {
        this.http.setHeader('*', key, value);
    }

    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response> {
        return this.invokeRequest(HttpRequestType.GET, baseUrl + path, parameters, headers);
    }

    patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response> {
        return this.invokeRequest(HttpRequestType.PATCH, baseUrl + path, body, headers);
    }

    post(baseUrl: string, path: string, headers: any, body: any): Observable<Response> {
        return this.invokeRequest(HttpRequestType.POST, baseUrl + path, body, headers);
    }

    private invokeRequest(type: HttpRequestType, url: string, parametersOrData: any,
                          headers: { [key: string]: string }): Observable<Response> {
        const observable = new Subject<Response>();

        this.http[type.toLowerCase()](url, parametersOrData, headers, (response) => {
            const r = new Response();
            r.body = JSON.parse(response.data);
            r.responseCode = response.status;
            r.errorMesg = response.error;
            observable.next(r);
            observable.complete();
        }, (response) => {
            const r = new Response();
            r.body = JSON.parse(response.data);
            r.responseCode = response.status;
            r.errorMesg = response.error;
            observable.next(r);
            observable.complete();
        });

        return observable;
    }
}
