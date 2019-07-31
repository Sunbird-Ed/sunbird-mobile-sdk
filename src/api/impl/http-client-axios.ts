import {HttpClient, HttpSerializer, NetworkError, Response, ResponseCode, ServerError} from '..';
import {Observable} from 'rxjs';
import * as qs from 'qs';

export class HttpClientAxios implements HttpClient {

    private headers: { [key: string]: string } = {};
    private axios;
    private serializer?: HttpSerializer;

    constructor() {
        import('axios').then((a) => this.axios = a.default);
    }

    setSerializer(httpSerializer: HttpSerializer) {
        this.serializer = httpSerializer;
    }

    addHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    addHeaders(headers: { [p: string]: string }) {
        this.headers = {...this.headers, ...headers};
    }

    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<Response> {
        return this.handleResponse(this.axios.get(baseUrl + path, {
            headers: {...this.headers, ...headers},
            params: parameters
        }));
    }

    patch(baseUrl: string, path: string, headers: any, body: any): Observable<Response> {
        if (this.serializer === HttpSerializer.URLENCODED && typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = qs.stringify(body);
        }

        return this.handleResponse(
            this.axios.patch(baseUrl + path, body, {headers: {...this.headers, ...headers}})
        );
    }

    post(baseUrl: string, path: string, headers: any, body: any): Observable<Response> {
        if (this.serializer === HttpSerializer.URLENCODED && typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = qs.stringify(body);
        }

        return this.handleResponse(
            this.axios.post(baseUrl + path, body, {headers: {...this.headers, ...headers}})
        );
    }

    private handleResponse(promise: Promise<any>): Observable<Response> {
        return Observable.fromPromise(
            promise.then(async (axiosResponse) => {
                const sunbirdResponse = new Response<any>();
                sunbirdResponse.responseCode = axiosResponse.status;
                sunbirdResponse.body = axiosResponse.data;
                return sunbirdResponse;
            })
                .catch(async (e) => {
                    if (!e.response) {
                        throw new NetworkError(`
                            ${e.config.url} -
                            ${e || ''}
                        `);
                    }

                    if (typeof e.response.data === 'object') {
                        const sunbirdResponse = new Response<any>();

                        sunbirdResponse.body = e.response.data;
                        sunbirdResponse.responseCode = e.response.status;
                        sunbirdResponse.errorMesg = 'SERVER_ERROR';

                        if (sunbirdResponse.responseCode === ResponseCode.HTTP_UNAUTHORISED
                            || sunbirdResponse.responseCode === ResponseCode.HTTP_FORBIDDEN) {
                            return sunbirdResponse;
                        } else {
                            throw new ServerError(`
                                ${e.request.url} -
                                ${e || ''}
                            `, sunbirdResponse);
                        }
                    } else {
                        throw new NetworkError(`
                            ${e.config.url}
                        `);
                    }
                })
        );
    }
}
