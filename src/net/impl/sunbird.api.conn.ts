import {Injectable} from "@angular/core";
import {APIRequest, REQUEST_TYPE} from "../def/api.request";
import {APIResponseInterceptor} from "../def/api.interceptor";
import {APIConfig} from "../config/api.config";
import {SunbirdAPIResponse} from "./sunbird.response";
import {APIResponse} from "../def/api.response";
import {HTTPResponse} from "@ionic-native/http";
import {APIConnection} from "../def/api.conn";
import {HttpClient} from '..';

@Injectable()
export class SunbirdAPIConnection implements APIConnection{

    constructor(protected http: HttpClient<HTTPResponse>,
                protected interceptor: APIResponseInterceptor,
                protected apiConfig: APIConfig) {

    }

    protected init() {
        this.http.withBaseUrl("");
        this.addGlobalHeader(this.apiConfig);
    }

    protected addGlobalHeader(apiConfig: APIConfig) {
        let header = {
            "X-Channel-Id": apiConfig.channelId,
            "X-App-Id": apiConfig.producerId,
            "X-Device-Id": apiConfig.deviceId
        };
        this.http.addHeaders(header);
    }

    useAPIToken(token: string) {
        this.http.addHeader("Authorization", "Bearer " + token);
    }

    invoke(request: APIRequest): Promise<APIResponse> {
        switch (request.type) {
            case REQUEST_TYPE.GET:
                return this.http.get(request.path, request.headers, request.parameters)
                    .then((response: HTTPResponse) => {
                        return this.intercept(request, response);
                    });
            case REQUEST_TYPE.PATCH:
                return this.http.patch(request.path, request.headers, request.body!!)
                    .then((response: HTTPResponse) => {
                        return this.intercept(request, response);
                    });;
            case REQUEST_TYPE.POST:
                return this.http.post(request.path, request.headers, request.body!!)
                    .then((response: HTTPResponse) => {
                        return this.intercept(request, response);
                    });;
        }
    }

    private intercept(request: APIRequest, response: HTTPResponse): Promise<APIResponse> {
        return this.interceptor.onResponse(
            request, new SunbirdAPIResponse(response.status, response.error!!, response.data), this);
    }

}