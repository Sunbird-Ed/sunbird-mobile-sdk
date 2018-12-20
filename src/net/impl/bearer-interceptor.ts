import {ApiConfig, ResponseInterceptor} from "..";
import {Request} from "..";
import {Response, RESPONSE_CODE_TYPE} from "..";
import {MobileAuthHandler} from './mobile-auth-handler';
import {Connection} from '..';
import {KEY_API_TOKEN} from "..";

export class BearerInterceptor implements ResponseInterceptor {

    private authHandler: MobileAuthHandler;

    constructor(private apiConfig: ApiConfig) {
        this.authHandler = new MobileAuthHandler();
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        return this.authHandler.resetAuthToken(this.apiConfig, connection)
            .then((bearerToken: string) => {
                localStorage.setItem(KEY_API_TOKEN, bearerToken);
                return connection.invoke(request);
            });
    }
}