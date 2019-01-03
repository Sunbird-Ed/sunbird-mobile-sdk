import {Authenticator} from '../def/authenticator';
import {ApiTokenHandler} from '../util/api-token-handler';
import {ApiConfig, Connection, KEY_API_TOKEN, Request, Response, ResponseCode} from '..';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(private apiConfig: ApiConfig) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig);
    }

    interceptRequest(request: Request): Request {
        const bearerToken = localStorage.getItem(KEY_API_TOKEN);

        if (bearerToken) {
            const existingHeaders = request.headers;
            existingHeaders['Authorization'] = `Bearer ${bearerToken}`;
            request.headers = existingHeaders;
        }
        return request;
    }

    onResponse(request: Request, response: Response, connection: Connection): Promise<Response> {
        if (response.code() !== ResponseCode.HTTP_UNAUTHORISED) {
            return Promise.resolve(response);
        }

        if (!response.response().message) {
            return Promise.resolve(response);
        }

        return this.apiTokenHandler.refreshAuthToken(connection)
            .then((bearerToken: string) => {
                localStorage.setItem(KEY_API_TOKEN, bearerToken);
                return connection.invoke(request);
            });
    }
}
