import {ApiConfig, Connection, KEY_API_TOKEN, Request, Response, RESPONSE_CODE_TYPE, ResponseInterceptor} from "..";
import {MobileAuthHandler} from './mobile-auth-handler';

export class BearerInterceptor implements ResponseInterceptor {

    private authHandler: MobileAuthHandler;

    constructor(private apiConfig: ApiConfig) {
        this.authHandler = new MobileAuthHandler(this.apiConfig);
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        return this.authHandler.resetAuthToken(connection)
            .then((bearerToken: string) => {
                localStorage.setItem(KEY_API_TOKEN, bearerToken);
                return connection.invoke(request);
            });
    }
}