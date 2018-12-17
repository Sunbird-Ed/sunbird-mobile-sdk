import {APIRequest} from "./api.request";
import {APIResponse} from "./api.response";
import {APIConnection} from './api.conn';

export abstract class APIResponseInterceptor {

    /**
     * Intercept response
     *
     * @param {APIRequest} request - The request used to invoke API
     * @param {APIResponse} response - The response from the API
     * @param {APIConnection} connection - The connection used to establish the API
     * @return {Promise<APIResponse>} The response after interceptor mutation
     */
    abstract onResponse(request: APIRequest, response: APIResponse, connection: APIConnection): Promise<APIResponse>;
}