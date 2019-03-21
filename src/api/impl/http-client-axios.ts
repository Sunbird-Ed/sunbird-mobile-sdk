import {HttpClient, HttpSerializer, NetworkError, Response} from '..';
import {Observable} from 'rxjs';
import * as axios from 'axios';
import {AxiosError, AxiosResponse, AxiosStatic} from 'axios';

export class HttpClientAxios implements HttpClient {

    private headers: { [key: string]: string } = {};
    private axios: AxiosStatic;

    constructor() {
        this.axios = axios.default;
    }

    setSerializer(httpSerializer: HttpSerializer) {
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
        return this.handleResponse(this.axios.patch(baseUrl + path, body, {headers: {...this.headers, ...headers}}));
    }

    post(baseUrl: string, path: string, headers: any, body: any): Observable<Response> {
        return this.handleResponse(this.axios.post(baseUrl + path, body, {headers: {...this.headers, ...headers}}));
    }

    private handleResponse(promise: Promise<AxiosResponse<any>>): Observable<Response> {
        return Observable.fromPromise(
            promise.then(async (axiosResponse) => {
                const sunbirdResponse = new Response<any>();
                sunbirdResponse.responseCode = axiosResponse.status;
                sunbirdResponse.body = axiosResponse.data;
                return sunbirdResponse;
            })
                .catch(async (e: AxiosError) => {
                    if (!e.response) {
                        throw new NetworkError(`
                            ${e.config.url} -
                            ${e || ''}
                        `);
                    }

                    if (typeof e.response.data === 'object') {
                        const sunbirdResponse = new Response<any>();
                        sunbirdResponse.errorMesg = 'SERVER_ERROR';
                        sunbirdResponse.responseCode = e.response.status;
                        sunbirdResponse.body = e.response.data;
                        return sunbirdResponse;
                    } else {
                        throw new NetworkError(`
                            ${e.config.url}
                        `);
                    }
                })
        );
    }
}
