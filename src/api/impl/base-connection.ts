import {ApiConfig, HttpClient, HttpRequestType, Request, Response} from '..';
import {Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';
import {Connection} from '../def/connection';
import {Authenticator} from '../def/authenticator';
import {ApiAuthenticator} from './api-authenticator';
import {SessionAuthenticator} from '../../auth';

export class BaseConnection implements Connection {

    constructor(protected http: HttpClient,
                protected apiConfig: ApiConfig) {
        this.addGlobalHeader();
    }

    public invoke(request: Request): Observable<Response> {
        this.buildInterceptorsFromAuthenticators(request);

        request = this.interceptRequest(request);

        let response = (async () => {
            switch (request.type) {
                case HttpRequestType.GET:
                    response = await this.http.get(this.apiConfig.baseUrl, request.path, request.headers, request.parameters).toPromise();
                    break;
                case HttpRequestType.PATCH:
                    response = await this.http.patch(this.apiConfig.baseUrl, request.path, request.headers, request.body).toPromise();
                    break;
                case HttpRequestType.POST:
                    response = await this.http.post(this.apiConfig.baseUrl, request.path, request.headers, request.body).toPromise();
                    break;
            }

            response = await this.interceptResponse(request, response);
            return response;
        })();

        return Observable.fromPromise(response);

    }

    protected addGlobalHeader() {
        const header = {
            'X-Channel-Id': this.apiConfig.api_authentication.channelId,
            'X-App-Id': this.apiConfig.api_authentication.producerId,
            'X-Device-Id': SHA1(this.apiConfig.api_authentication.deviceId).toString(),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        };
        this.http.addHeaders(header);
    }

    private buildInterceptorsFromAuthenticators(request: Request) {
        if (request.withApiToken) {
            request.authenticators.push(new ApiAuthenticator(this.apiConfig, this));
        }

        if (request.withSessionToken) {
            request.authenticators.push(new SessionAuthenticator(this.apiConfig, this));
        }

        request.authenticators.forEach((authenticator: Authenticator) => {
            request.requestInterceptors.push(authenticator);
            request.responseInterceptors.push(authenticator);
        });
    }

    private interceptRequest(request: Request): Request {
        const interceptors = request.requestInterceptors;
        for (const interceptor of interceptors) {
            request = interceptor.interceptRequest(request);
        }
        return request;
    }

    private async interceptResponse(request: Request, response: Response): Promise<Response> {
        const interceptors = request.responseInterceptors;
        for (const interceptor of interceptors) {
            response = await interceptor.interceptResponse(request, response).toPromise();
        }

        return response;
    }

}
