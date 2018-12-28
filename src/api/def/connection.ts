import {Request} from "./request";
import {Response} from "./response";
import {ResponseInterceptor} from "./response-interceptor";

export interface Connection {

    addResponseInterceptor(responseInteptor: ResponseInterceptor);

    invoke(request: Request): Promise<Response>

}