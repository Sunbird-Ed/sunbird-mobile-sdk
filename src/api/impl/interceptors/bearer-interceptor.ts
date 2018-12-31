import {
    ApiConfig,
    Connection,
    KEY_API_TOKEN,
    Request,
    Response,
    RESPONSE_CODE_TYPE,
    ResponseInterceptor
} from "../../index";
import {MobileApiAuthService} from '../auth/mobile-api-auth-service';

export class BearerInterceptor implements ResponseInterceptor {

    private authHandler: MobileApiAuthService;

    constructor(private apiConfig: ApiConfig) {
        this.authHandler = new MobileApiAuthService(this.apiConfig);
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        if (!response.response().message) {
            return Promise.resolve(response);
        }

        return this.authHandler.refreshAuthToken(connection)
            .then((bearerToken: string) => {
                localStorage.setItem(KEY_API_TOKEN, bearerToken);
                return connection.invoke(request);
            });
    }
}