import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response} from '../../api';
import {OauthSession} from '..';
import {ApiKeys} from '../../app-config';
import {NoActiveSessionError} from '../../profile';
import {AuthEndPoints} from '../def/auth-end-points';

export class AuthUtil {
    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
    }

    public async refreshSession(): Promise<undefined> {
        if (!this.hasExistingSession()) {
            throw new NoActiveSessionError('No Active Sessions found');
        }

        const request = new Request.Builder()
            .withPath(this.apiConfig.user_authentication.authUrl + AuthEndPoints.REFRESH)
            .withType(HttpRequestType.POST)
            .withSerializer(HttpSerializer.URLENCODED)
            .withBody({
                refresh_token: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN),
                grant_type: 'refresh_token',
                client_id: 'android'
            })
            .build();


        const response: Response = await this.apiService.fetch(request).toPromise();

        const sessionData: OauthSession = {
            ...response.body,
            userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.accessToken)
        };

        await this.startSession(sessionData);

        return;
    }

    public startSession(sessionData: OauthSession) {
        localStorage.setItem(ApiKeys.KEY_ACCESS_TOKEN, sessionData.accessToken);
        localStorage.setItem(ApiKeys.KEY_REFRESH_TOKEN, sessionData.refreshToken);
        localStorage.setItem(ApiKeys.KEY_USER_ID, sessionData.userToken);
    }

    public async endSession(): Promise<undefined> {
        return new Promise<undefined>(((resolve, reject) => {
            const launchUrl = this.apiConfig.host +
                this.apiConfig.user_authentication.authUrl + AuthEndPoints.LOGOUT + '?redirect_uri=' +
                this.apiConfig.user_authentication.redirectUrl;

            customtabs.isAvailable(() => {
                customtabs.launch(launchUrl!!, success => {
                    localStorage.removeItem(ApiKeys.KEY_ACCESS_TOKEN);
                    localStorage.removeItem(ApiKeys.KEY_REFRESH_TOKEN);
                    localStorage.removeItem(ApiKeys.KEY_USER_ID);
                    resolve();
                }, error => {
                    reject(error);
                });
            }, error => {
                customtabs.launchInBrowser(launchUrl!!, callbackUrl => {
                    localStorage.removeItem(ApiKeys.KEY_ACCESS_TOKEN);
                    localStorage.removeItem(ApiKeys.KEY_REFRESH_TOKEN);
                    localStorage.removeItem(ApiKeys.KEY_USER_ID);
                    resolve();
                }, err => {
                    reject(err);
                });
            });
        }));
    }

    public async getSessionData(): Promise<OauthSession | undefined> {
        if (!this.hasExistingSession()) {
            return undefined;
        }

        return {
            accessToken: localStorage.getItem(ApiKeys.KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(ApiKeys.KEY_USER_ID)!
        };
    }

    private hasExistingSession(): boolean {
        return !!(localStorage.getItem(ApiKeys.KEY_ACCESS_TOKEN) &&
            localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN) &&
            localStorage.getItem(ApiKeys.KEY_USER_ID));
    }
}
