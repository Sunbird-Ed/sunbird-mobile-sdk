import {
    ApiConfig,
    HttpRequestType,
    JWTUtil,
    Request,
    RequestInterceptor,
    Response,
    ResponseCode,
    ResponseInterceptor
} from '../../api/index';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../app-config';
import {Connection} from '../../api/def/connection';
import {OauthSession} from '..';

export class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {


    constructor(private apiConfig: ApiConfig, private connection: Connection) {
    }

    interceptRequest(request: Request): Request {
        const sessionToken = localStorage.getItem(ApiKeys.KEY_ACCESS_TOKEN);

        if (sessionToken) {
            const existingHeaders = request.headers;
            existingHeaders['X-Authenticated-User-Token'] = sessionToken;
            request.headers = existingHeaders;
        } else {
            throw new Error('No Session Found');
        }

        return request;
    }

    interceptResponse(request: Request, response: Response): Observable<Response> {
        if (response.responseCode !== ResponseCode.HTTP_UNAUTHORISED) {
            return Observable.of(response);
        }

        if (response.body().message) {
            return Observable.of(response);
        }

        return Observable.fromPromise(this.invokeRefreshSessionTokenApi())
            .mergeMap(() => this.connection.invoke(request));
    }

    private async invokeRefreshSessionTokenApi() {
        const request = new Request.Builder()
            .withPath(this.apiConfig.user_authentication.authUrl)
            .withType(HttpRequestType.POST)
            .withBody({
                refresh_token: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN),
                grant_type: 'refresh_token',
                client_id: 'android'
            })
            .build();

        const response: Response = await this.connection.invoke(request).toPromise();

        const sessionData: OauthSession = {
            ...response.body,
            userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.accessToken)
        };

        await this.startSession(sessionData);

        return;
    }

    private async startSession(sessionData: OauthSession): Promise<undefined> {
        localStorage.setItem(ApiKeys.KEY_ACCESS_TOKEN, sessionData.accessToken);
        localStorage.setItem(ApiKeys.KEY_REFRESH_TOKEN, sessionData.refreshToken);
        localStorage.setItem(ApiKeys.KEY_USER_TOKEN, sessionData.userToken);

        return;
    }
}
