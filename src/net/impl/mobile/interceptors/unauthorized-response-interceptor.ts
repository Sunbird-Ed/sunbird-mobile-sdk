import {ResponseInterceptor} from "../../../def/response-interceptor";
import {Injectable} from "@angular/core";
import {Request} from "../../../def/request";
import {Response, RESPONSE_CODE_TYPE} from "../../../def/response";
import {AuthHandler} from '../../../def/auth-handler';
import {Connection} from '../../../index';

@Injectable()
export class UnauthorisedResponseInterceptor extends ResponseInterceptor {

    constructor(private authHandler: AuthHandler) {
        super();
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
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