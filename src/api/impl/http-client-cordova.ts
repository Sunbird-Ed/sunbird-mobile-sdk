import {HttpClient, HttpRequestType, HttpSerializer, Response, ResponseCode, NetworkError, HttpServerError, HttpClientError} from '..';
import {Observable, Subject} from 'rxjs';

interface CordovaHttpClientResponse {
    data?: string;
    error?: string;
    status: number;
}

export class HttpClientCordova implements HttpClient {

    private http = cordova.plugin.http;

    constructor() {
    }

    setSerializer(httpSerializer: HttpSerializer) {
        this.http.setDataSerializer(httpSerializer);
    }

    addHeaders(headers: { [key: string]: string }) {
        for (const key in headers) {
            if (headers.hasOwnProperty(key)) {
                this.http.setHeader('*', key, headers[key]);
            }
        }
    }

    addHeader(key: string, value: string) {
        this.http.setHeader('*', key, value);
    }

    get(baseUrl: string, path: string, headers: any, parameters: { [key: string]: string }): Observable<Response> {
        return this.invokeRequest(HttpRequestType.GET, baseUrl + path, parameters, headers);
    }

    patch(baseUrl: string, path: string, headers: any, body: {}): Observable<Response> {
        return this.invokeRequest(HttpRequestType.PATCH, baseUrl + path, body, headers);
    }

    post(baseUrl: string, path: string, headers: any, body: {}): Observable<Response> {
        return this.invokeRequest(HttpRequestType.POST, baseUrl + path, body, headers);
    }

    private invokeRequest(type: HttpRequestType, url: string, parametersOrData: any,
                          headers: { [key: string]: string }): Observable<Response> {
        const observable = new Subject<Response>();

        this.http[type.toLowerCase()](url, parametersOrData, headers, (response: CordovaHttpClientResponse) => {
            const r = new Response();

            try {
                r.body = JSON.parse(response.data!);
            } catch (e) {
                r.body = response.data;
            }

            r.responseCode = response.status;
            r.errorMesg = '';
            observable.next(r);
            observable.complete();

        }, (response: CordovaHttpClientResponse) => {
            const r = new Response();

            if (response.status === 0) {
                observable.error(new NetworkError(`
                    ${url} -
                    ${response.error || ''}
                `));
                observable.complete();

                return;
            }


            try {
                r.body = JSON.parse(response.error!);
                r.responseCode = response.status;
                r.errorMesg = 'SERVER_ERROR';

                if (r.responseCode === ResponseCode.HTTP_UNAUTHORISED || r.responseCode === ResponseCode.HTTP_FORBIDDEN) {
                    observable.next(r);
                    observable.complete();
                } else {
                    if (r.responseCode >= 400 && r.responseCode <= 499) {
                        observable.error(new HttpClientError(`
                            ${url} -
                            ${response.error || ''}
                        `, r));
                    } else {
                        observable.error(new HttpServerError(`
                            ${url} -
                            ${response.error || ''}
                        `, r));
                    }
                }
            } catch (e) {
                observable.error(new NetworkError(`
                    ${url} -
                    ${response.error || ''}
                `));
                observable.complete();
            }
        });

        return observable;
    }
}
