import {Connection, Request, Response, RESPONSE_CODE_TYPE, ResponseInterceptor} from "../../index";

export class SessionInterceptor implements ResponseInterceptor {

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        return this.refreshToken();
    }

    private async refreshToken(): Promise<Response> {
        // TODO
        return null as any;
    }
}