import {ApiConfig, ApiService, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {OauthSession} from '..';
import {ApiKeys} from '../../app-config';

export class AuthUtil {
    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
    }

    public async refreshSession(): Promise<undefined> {

        const request = new Request.Builder()
            .withPath('/api' + this.apiConfig.user_authentication.authUrl)
            .withType(HttpRequestType.POST)
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

    public endSession() {
        localStorage.removeItem(ApiKeys.KEY_ACCESS_TOKEN);
        localStorage.removeItem(ApiKeys.KEY_REFRESH_TOKEN);
        localStorage.removeItem(ApiKeys.KEY_USER_ID);
    }

    public async getSessionData(): Promise<OauthSession> {
        return {
            accessToken: localStorage.getItem(ApiKeys.KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(ApiKeys.KEY_USER_ID)!
        };
    }
}
