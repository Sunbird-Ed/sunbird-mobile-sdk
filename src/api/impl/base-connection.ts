import {ApiConfig, Connection, HttpClient, HttpRequestType, Request, Response} from '..';
import {Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';

export class BaseConnection implements Connection {

    constructor(protected http: HttpClient,
                protected apiConfig: ApiConfig) {
        this.addGlobalHeader();
    }

    private static interceptRequest(request: Request): Request {
        const authenticators = request.authenticators;
        for (const authenticator of authenticators) {
            request = authenticator.interceptRequest(request);
        }
        return request;
    }

    protected addGlobalHeader() {
        const header = {
            'X-Channel-Id': this.apiConfig.api_authentication.channelId,
            'X-App-Id': this.apiConfig.api_authentication.producerId,
            'X-Device-Id': SHA1(this.apiConfig.api_authentication.deviceId)
        };
        this.http.addHeaders(header);
    }

    invoke(request: Request): Observable<Response> {

        let response = (async () => {
            request = BaseConnection.interceptRequest(request);

            switch (request.type) {
                case HttpRequestType.GET:
                    response = await this.http.get(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                    response = await this.interceptResponse(request, response);
                    return response;
                case HttpRequestType.PATCH:
                    response = await this.http.patch(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                    response = await this.interceptResponse(request, response);
                    return response;
                case HttpRequestType.POST:
                    response = await this.http.post(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                    response = await this.interceptResponse(request, response);
                    return response;
            }
        })();

        return Observable.fromPromise(response);

    }

    private async interceptResponse(request: Request, response: Response): Promise<Response> {
        const authenticators = request.authenticators;
        for (const authenticator of authenticators) {
            response = await authenticator.onResponse(request, response, this).toPromise();
        }

        const interceptors = request.responseInterceptors;
        for (const interceptor of interceptors) {
            response = await interceptor.onResponse(request, response, this).toPromise();
        }
        return response;
    }

}
