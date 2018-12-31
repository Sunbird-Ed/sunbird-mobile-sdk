import {ApiConfig, Connection, Request, Response, RESPONSE_CODE_TYPE, ResponseInterceptor} from "../../";
import {MobileUserAuthService} from '../auth/mobile-user-auth-service';

export class SessionInterceptor implements ResponseInterceptor {

    private authHandler: MobileUserAuthService;

    constructor(private apiConfig: ApiConfig) {
        this.authHandler = new MobileUserAuthService(this.apiConfig);
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== RESPONSE_CODE_TYPE.UNAUTHORISED) {
            return Promise.resolve(response);
        }

        if (response.response().message) {
            return Promise.resolve(response);
        }

        return this.refreshToken(request, connection);
    }

    private async refreshToken(request, connection): Promise<Response> {
        const sessionData = await this.authHandler.refreshSession(connection);
        await this.authHandler.startSession(sessionData);

        return connection.invoke(request);
    }
}