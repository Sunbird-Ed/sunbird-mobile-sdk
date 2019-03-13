import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response} from '../../api';
import {OAuthSession} from '..';
import {ApiKeys} from '../../app-config';
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

        sessionData = {
            ...response.body,
            userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.access_token)
        };

        await this.startSession(sessionData!);

        return;
    }

    public async startSession(sessionData: OAuthSession): Promise<void> {
        await this.sharedPreferences.putString(ApiKeys.KEY_OAUTH_SESSION, JSON.stringify(sessionData));
    }

    public async endSession(): Promise<void> {
        return new Promise<void>(((resolve, reject) => {
            const launchUrl = this.apiConfig.host +
                this.apiConfig.user_authentication.authUrl + AuthEndPoints.LOGOUT + '?redirect_uri=' +
                this.apiConfig.user_authentication.redirectUrl;

            customtabs.isAvailable(() => {
                customtabs.launch(launchUrl!!, async () => {
                    await this.sharedPreferences.putString(ApiKeys.KEY_OAUTH_SESSION, '');
                    resolve();
                }, error => {
                    reject(error);
                });
            }, error => {
                customtabs.launchInBrowser(launchUrl!!, async () => {
                    await this.sharedPreferences.putString(ApiKeys.KEY_OAUTH_SESSION, '');
                    resolve();
                }, err => {
                    reject(err);
                });
            });
        }));
    }

    public async getSessionData(): Promise<OAuthSession | undefined> {
        const stringifiedSessionData = await this.sharedPreferences.getString(ApiKeys.KEY_OAUTH_SESSION).toPromise();

        if (!stringifiedSessionData) {
            return undefined;
        }

        return JSON.parse(stringifiedSessionData);
    }
}
