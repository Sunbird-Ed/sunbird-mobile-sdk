import {Connection, ResponseInterceptor, Request, Response} from "..";

export class SessionInterceptor implements ResponseInterceptor{

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        throw new Error("method not implemented yet!!");
    }

}