import {ApiConfig, HttpClient, HttpRequestType, HttpSerializer, Request, Response, ResponseCode} from '..';
import {Observable} from 'rxjs';
import {Connection} from '../def/connection';
import {Authenticator} from '../def/authenticator';
import {ApiAuthenticator} from './api-authenticator';
import {SessionAuthenticator} from '../../auth';
import * as qs from 'qs';
import {DeviceInfo} from '../../util/device/def/device-info';

export class BaseConnection implements Connection {

    constructor(protected http: HttpClient,
                protected apiConfig: ApiConfig,
                protected deviceInfo: DeviceInfo) {
        this.addGlobalHeader();
    }

    public invoke(request: Request): Observable<Response> {
        this.buildInterceptorsFromAuthenticators(request);

        request = this.interceptRequest(request);

        let response = (async () => {
            switch (request.type) {
                case HttpRequestType.GET:
                    response = await this.http.get(request.host || this.apiConfig.host, request.path, request.headers, request.parameters).toPromise();
                    break;
                case HttpRequestType.PATCH:
                    response = await this.http.patch(request.host || this.apiConfig.host, request.path, request.headers, request.body).toPromise();
                    break;
                case HttpRequestType.POST:
                    response = await this.http.post(request.host || this.apiConfig.host, request.path, request.headers, request.body).toPromise();
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
            'X-Device-Id': this.deviceInfo.getDeviceID(),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        };
        this.http.addHeaders(header);
    }

    private buildInterceptorsFromAuthenticators(request: Request) {
        if (request.withApiToken) {
            request.authenticators.push(new ApiAuthenticator(this.apiConfig, this.deviceInfo, this));
        }

        if (request.withSessionToken) {
            request.authenticators.push(new SessionAuthenticator(this.apiConfig, this));
        }

        request.authenticators.forEach((authenticator: Authenticator) => {
            request.requestInterceptors.push(authenticator);
            request.responseInterceptors.push(authenticator);
        });

        if (this.http.setSerializer(request.serializer) === HttpSerializer.URLENCODED) {
            request.body = qs.stringify(request.body);
        }

        this.http.setSerializer(request.serializer);
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

        if (response.responseCode !== ResponseCode.HTTP_SUCCESS) {
            throw response;
        }

        return response;
    }

}
