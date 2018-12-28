import {HttpClient} from "../def/http-client";
import {Response} from "../def/response";

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
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                this.http.setHeader('*', key, headers[key]);
            }
        }
    }

    addHeader(key: string, value: string) {
        this.http.setHeader('*', key, value);
    }

    get(baseUrl: string, path: string, headers: any, parameters: any): Promise<Response> {
        return this.invokeRequest('get', baseUrl + path, parameters, headers);
    }

    patch(baseUrl: string, path: string, headers: any, body: any): Promise<Response> {
        return this.invokeRequest('patch', baseUrl + path, body, headers);
    }

    post(baseUrl: string, path: string, headers: any, body: any): Promise<Response> {
        return this.invokeRequest('patch', baseUrl + path, body, headers);
    }

    private invokeRequest(type: 'get' | 'post' | 'patch', url: string, parametersOrData: any, headers: { [key: string]: string }): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.http[type](url, parametersOrData, headers, (response) => {
                try {
                    resolve(new Response(response.status, response.error!!, JSON.parse(response.data)));
                } catch (e) {
                    throw e;
                }
            }, (response) => {
                try {
                    reject(new Response(response.status, response.error!!, JSON.parse(response.data)));
                } catch (e) {
                    throw e;
                }
            })
        });
    }
}