import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response} from '../../api';
import {OAuthSession, SignInError} from '..';
import {AuthKeys} from '../../preference-keys';
import {NoActiveSessionError} from '../../profile';
import {AuthEndPoints} from '../def/auth-end-points';
import {SharedPreferences} from '../../util/shared-preferences';

export class AuthUtil {
    constructor(private apiConfig: ApiConfig, private apiService: ApiService, private sharedPreferences: SharedPreferences) {
    }

    public async refreshSession(): Promise<void> {
        let sessionData = await this.getSessionData();

        if (!sessionData) {
            throw new NoActiveSessionError('No Active Sessions found');
        }

        const request = new Request.Builder()
            .withPath(this.apiConfig.user_authentication.authUrl + AuthEndPoints.REFRESH)
            .withType(HttpRequestType.POST)
            .withSerializer(HttpSerializer.URLENCODED)
            .withBody({
                refresh_token: sessionData.refresh_token,
                grant_type: 'refresh_token',
                client_id: 'android'
            })
            .build();


        const response: Response = await this.apiService.fetch(request).toPromise();

        if (response.body.access_token && response.body.refresh_token) {
            const jwtPayload: { sub: string } = JWTUtil.getJWTPayload(response.body.access_token);

            const userToken = jwtPayload.sub.split(':').length === 3 ? <string>jwtPayload.sub.split(':').pop() : jwtPayload.sub;

            sessionData = {
                ...response.body,
                userToken
            };

            await this.startSession(sessionData!);

            return;
        }

        throw new SignInError('Server Error');
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
