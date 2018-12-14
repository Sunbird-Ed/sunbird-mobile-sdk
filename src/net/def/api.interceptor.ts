import {APIRequest} from "./api.request";
import {APIResponse} from "./api.response";

export abstract class APIResponseInterceptor {

    abstract onResponse(request: APIRequest, response: APIResponse): Promise<APIResponse>;

}