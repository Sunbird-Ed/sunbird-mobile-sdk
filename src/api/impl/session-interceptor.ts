import {Connection, Request, Response, ResponseInterceptor} from "..";

export class SessionInterceptor implements ResponseInterceptor {

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        throw new Error("method not implemented yet!!");
    }

}