import {APIResponseInterceptor} from "../def/api.interceptor";
import {Injectable} from "@angular/core";
import {APIRequest} from "../def/api.request";
import {APIResponse} from "../def/api.response";

@Injectable()
export class SunbirdResponseInterceptor implements APIResponseInterceptor{

    onResponse(request: APIRequest, response: APIResponse): Promise<APIResponse> {
        // if (response.code() == 401) {
        //     //get bearer token
        // }
        // return response;
        return new Promise<APIResponse>((resolve, reject) => {});
    }



}