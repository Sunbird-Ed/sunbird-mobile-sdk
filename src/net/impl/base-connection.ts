import {Request, REQUEST_TYPE} from "..";
import {ResponseInterceptor} from "..";
import {ApiConfig} from "..";
import {Response} from "..";
import {Connection} from "..";
import {HttpClient} from '..';

export class BaseConnection implements Connection {

    private responseInterceptors: Array<ResponseInterceptor>;

    constructor(protected http: HttpClient,
                protected apiConfig: ApiConfig) {
        this.responseInterceptors = [];
        this.addGlobalHeader();
    }

    protected addGlobalHeader() {
        let header = {
            "X-Channel-Id": this.apiConfig.channelId,
            "X-App-Id": this.apiConfig.producerId,
            "X-Device-Id": this.apiConfig.deviceId
        };
        this.http.addHeaders(header);
    }

    addResponseInterceptor(responseInterceptor: ResponseInterceptor) {
        this.responseInterceptors.push(responseInterceptor);
    }

    async invoke(request: Request): Promise<Response> {

        let response;

        switch (request.type) {
            case REQUEST_TYPE.GET:
                response = await this.http.get(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.intercept(request, response);
                return response;
            case REQUEST_TYPE.PATCH:
                response = await this.http.patch(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.intercept(request, response);
                return response;
            case REQUEST_TYPE.POST:
                response = await this.http.post(this.apiConfig.baseUrl, request.path, request.headers, request.parameters);
                response = await this.intercept(request, response);
                return response;
        }
    }

    private async intercept(request: Request, response: Response): Promise<Response> {
        for (let interceptor of this.responseInterceptors) {
            response = await interceptor.onResponse(request, response, this);
        }
        return response;
    }

}