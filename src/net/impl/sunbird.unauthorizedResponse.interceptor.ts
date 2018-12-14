import {APIResponseInterceptor} from "../def/api.interceptor";
import {Injectable} from "@angular/core";
import {APIRequest} from "../def/api.request";
import {APIResponse, RESPONSE_CODE_TYPE} from "../def/api.response";
import {APIAuthHandler} from '../def/api.authHandler';
import {APIConnection} from '..';

@Injectable()
export class SunbirdUnauthorisedResponseInterceptor extends APIResponseInterceptor {

    constructor(private authHandler: APIAuthHandler) {
        super();
    }

    onResponse(request: APIRequest, response: APIResponse, connection: APIConnection): Promise<APIResponse> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        return this.authHandler.resetAuthToken()
            .then((bearerToken: string) => {
                connection.useAPIToken(bearerToken);
                return connection.invoke(request)
            });
    }
}