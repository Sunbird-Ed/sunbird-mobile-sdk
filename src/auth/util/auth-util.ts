import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response, ResponseCode, ServerError} from '../../api';
import {OAuthSession} from '..';
import {AuthKeys} from '../../preference-keys';
import {NoActiveSessionError} from '../../profile';
import {AuthEndPoints} from '../def/auth-end-points';
import {SharedPreferences} from '../../util/shared-preferences';
import {AuthTokenRefreshErrorEvent, ErrorEventType, EventNamespace, EventsBusService} from '../../events-bus';
import {AuthTokenRefreshError} from '../errors/auth-token-refresh-error';

export class AuthUtil {
    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private sharedPreferences: SharedPreferences,
        private eventsBusService: EventsBusService
    ) {
    }

    public async refreshSession(): Promise<void> {
        let sessionData = await this.getSessionData();

        if (!sessionData) {
            throw new NoActiveSessionError('No Active Sessions found');
        }

        const request = new Request.Builder()
            .withPath('/auth/v1/refresh/token')
            .withType(HttpRequestType.POST)
            .withSerializer(HttpSerializer.URLENCODED)
            .withApiToken(true)
            .withBody({
                refresh_token: sessionData.refresh_token
            })
            .build();


        try {
            await this.apiService.fetch(request).toPromise()
                .catch((e) => {
                    if (e instanceof ServerError && e.response.responseCode === ResponseCode.HTTP_BAD_REQUEST) {
                        throw new AuthTokenRefreshError(e.message);
                    }

                    throw e;
                })
                .then((response: Response) => {
                    if (response.body.result.access_token && response.body.result.refresh_token) {
                        const jwtPayload: { sub: string } = JWTUtil.getJWTPayload(response.body.result.access_token);

                        const userToken = jwtPayload.sub.split(':').length === 3 ? <string>jwtPayload.sub.split(':').pop() : jwtPayload.sub;

                        sessionData = {
                            ...response.body.result,
                            userToken
                        };

                        return this.startSession(sessionData!);
                    }

                    throw new AuthTokenRefreshError('No token found in server response');
                });
        } catch (e) {
            if (e instanceof AuthTokenRefreshError) {
                this.eventsBusService.emit({
                    namespace: EventNamespace.ERROR,
                    event: {
                        type: ErrorEventType.AUTH_TOKEN_REFRESH_ERROR,
                        payload: e
                    } as AuthTokenRefreshErrorEvent
                });
            }

            throw e;
        }
    }

    public async startSession(sessionData: OAuthSession): Promise<void> {
        await this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData)).toPromise();
    }

    public async endSession(): Promise<void> {
        return new Promise<void>(((resolve, reject) => {
            const launchUrl = this.apiConfig.host +
                this.apiConfig.user_authentication.authUrl + AuthEndPoints.LOGOUT + '?redirect_uri=' +
                this.apiConfig.host + '/oauth2callback';

            const inAppBrowserRef = cordova.InAppBrowser.open(launchUrl, '_blank', 'zoom=no');


            inAppBrowserRef.addEventListener('loadstart', async (event) => {
                if ((<string>event.url).indexOf('/oauth2callback') > -1) {
                    await this.sharedPreferences.putString(AuthKeys.KEY_OAUTH_SESSION, '').toPromise();

                    inAppBrowserRef.removeEventListener('exit', () => {
                    });
                    inAppBrowserRef.close();

                    resolve();
                }
            });

            inAppBrowserRef.addEventListener('exit', () => {
                reject();
            });
        }));
    }

    public async getSessionData(): Promise<OAuthSession | undefined> {
        const stringifiedSessionData = await this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION).toPromise();

        if (!stringifiedSessionData) {
            return undefined;
        }

        return JSON.parse(stringifiedSessionData);
    }
}
