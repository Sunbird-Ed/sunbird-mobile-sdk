import {Request} from "./request";
import {Response} from "./response";
import {Connection} from './connection';

export abstract class ResponseInterceptor {

    /**
     * Intercept response
     *
     * @param {Request} request - The request used to invoke API
     * @param {Response} response - The response from the API
     * @param {Connection} connection - The connection used to establish the API
     * @return {Promise<Response>} The response after interceptor mutation
     */
    abstract onResponse(request: Request, response: Response, connection: Connection): Promise<Response>;
}