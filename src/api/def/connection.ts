import {Request} from "./request";
import {Response} from "./response";
import {ResponseInterceptor} from "./response-interceptor";
import {Authenticator} from "./authenticator";

export interface Connection {

    invoke(request: Request): Promise<Response>

}