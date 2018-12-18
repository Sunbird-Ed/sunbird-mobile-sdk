import {Injectable} from "@angular/core";
import {Request, REQUEST_TYPE} from "../def/request";
import {ResponseInterceptor} from "../def/response-interceptor";
import {APIConfig} from "../config/api.config";
import {Response} from "../def/response";
import {Connection} from "../def/connection";
import {HttpClient} from '..';

@Injectable()
export class SunbirdConnection implements Connection {

    constructor(protected http: HttpClient,
                protected interceptor: ResponseInterceptor,
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

    invoke(request: Request): Promise<Response> {
        switch (request.type) {
            case REQUEST_TYPE.GET:
                return this.http.get(request.path, request.headers, request.parameters)
                    .then((response: Response) => {
                        return this.intercept(request, response);
                    });
            case REQUEST_TYPE.PATCH:
                return this.http.patch(request.path, request.headers, request.body!!)
                    .then((response: Response) => {
                        return this.intercept(request, response);
                    });;
            case REQUEST_TYPE.POST:
                return this.http.post(request.path, request.headers, request.body!!)
                    .then((response: Response) => {
                        return this.intercept(request, response);
                    });;
        }
    }

    private intercept(request: Request, response: Response): Promise<Response> {
        return this.interceptor.onResponse(
            request, response, this);
    }

}