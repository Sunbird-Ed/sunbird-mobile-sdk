import {
    ApiConfig,
    HttpRequestType,
    HttpSerializer,
    JWTUtil,
    Request,
    RequestInterceptor,
    Response,
    ResponseCode,
    ResponseInterceptor
} from '../../api';
import {Observable} from 'rxjs';
import {AuthKeys} from '../../preference-keys';
import {Connection} from '../../api/def/connection';
import {OAuthSession} from '..';
import {SharedPreferences} from '../../util/shared-preferences';

export class SessionAuthenticator implements RequestInterceptor, ResponseInterceptor {


    constructor(private sharedPreferences: SharedPreferences, private apiConfig: ApiConfig, private connection: Connection) {
    }

    interceptRequest(request: Request): Observable<Request> {
        return this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION)
            .map((stringifiedSessionData?: string) => {
                if (stringifiedSessionData) {
                    const sessionData: OAuthSession = JSON.parse(stringifiedSessionData);

                    const existingHeaders = request.headers;
                    existingHeaders['X-Authenticated-User-Token'] = sessionData.access_token;

                    request.headers = existingHeaders;
                } else {
                    throw new Error('No Session Found');
                }

                return request;
            });
    }

    interceptResponse(request: Request, response: Response): Observable<Response> {
        if (response.responseCode !== ResponseCode.HTTP_UNAUTHORISED) {
            return Observable.of(response);
        }

        if (response.body.message) {
            return Observable.of(response);
        }

        return Observable.fromPromise(this.invokeRefreshSessionTokenApi())
            .mergeMap(() => this.connection.invoke(request));
    }

    private async invokeRefreshSessionTokenApi() {
        const stringifiedSessionData = await this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION).toPromise();

        if (stringifiedSessionData) {
            let sessionData: OAuthSession = JSON.parse(stringifiedSessionData);

            const request = new Request.Builder()
                .withPath(this.apiConfig.user_authentication.authUrl + '/token')
                .withType(HttpRequestType.POST)
                .withSerializer(HttpSerializer.URLENCODED)
                .withBody({
                    refresh_token: sessionData.refresh_token,
                    grant_type: 'refresh_token',
                    client_id: 'android'
                })
                .build();

            const response: Response = await this.connection.invoke(request).toPromise();

            sessionData = {
                ...response.body,
                userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.access_token)
            };

            await this.startSession(sessionData);
        }

        return;
    }

    private async startSession(sessionData: OAuthSession): Promise<undefined> {
        this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData));

        return;
    }
}
