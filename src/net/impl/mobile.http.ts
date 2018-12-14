import {HttpClient} from "../def/http.client";
import {Injectable} from "@angular/core";
import {HTTP, HTTPResponse} from "@ionic-native/http";

@Injectable()
export class MobileHttpClient implements HttpClient<HTTPResponse>{

    private baseUrl: string;

    constructor(private http: HTTP) {

    }

    withBaseUrl(baseUrl: string) {
        this.baseUrl = baseUrl;
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

    get(path: string, headers: any, parameters: any): Promise<HTTPResponse> {
        return this.http.get(this.baseUrl + path, parameters, headers);
    }

    patch(path: string, headers: any, body: string): Promise<HTTPResponse> {
        return this.http.patch(this.baseUrl + path, body, headers);
    }

    post(path: string, headers: any, body: string): Promise<HTTPResponse> {
        return this.http.post(this.baseUrl + path, body, headers);
    }

}