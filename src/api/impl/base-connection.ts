import {ApiConfig, Connection, HttpClient, Request, REQUEST_TYPE, Response, ResponseInterceptor} from "..";
import {Authenticator} from "../def/authenticator";

export class BaseConnection implements Connection {

    constructor(protected http: HttpClient,
                protected apiConfig: ApiConfig) {
        this.addGlobalHeader();
    }

    protected addGlobalHeader() {
        let header = {
            "X-Channel-Id": this.apiConfig.api_authentication.channelId,
            "X-App-Id": this.apiConfig.api_authentication.producerId,
            "X-Device-Id": this.apiConfig.api_authentication.deviceId
        };
        this.http.addHeaders(header);
    }

    async invoke(request: Request): Promise<Response> {

        let response;

        request = BaseConnection.interceptRequest(request);

        switch (request.type) {
            case REQUEST_TYPE.GET:
                response = await this.http.get(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.interceptResponse(request, response);
                return response;
            case REQUEST_TYPE.PATCH:
                response = await this.http.patch(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.interceptResponse(request, response);
                return response;
            case REQUEST_TYPE.POST:
                response = await this.http.post(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.interceptResponse(request, response);
                return response;
        }
    }

    private static interceptRequest(request: Request): Request {
        const authenticators = request.authenticators;
        for (let authenticator of authenticators) {
            request = authenticator.interceptRequest(request);
        }
        return request;
    }

    private async interceptResponse(request: Request, response: Response): Promise<Response> {
        const authenticators = request.authenticators;
        for (let authenticator of authenticators) {
            response = await authenticator.onResponse(request, response, this);
        }

        const interceptors = request.responseInterceptors;
        for (let interceptor of interceptors) {
            response = await interceptor.onResponse(request, response, this);
        }
        return response;
    }

}