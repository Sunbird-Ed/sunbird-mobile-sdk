import {ApiService, Connection, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {OauthSession} from '..';
import {Observable} from 'rxjs';
import {ApiKeys} from '../../app-config';

export class AuthUtil {
    constructor(private apiService: ApiService) {
    }

    public async refreshSession(connection: Connection, authUrl: string): Promise<OauthSession> {

        const request = new Request.Builder()
            .withPath(authUrl)
            .withType(HttpRequestType.POST)
            .withBody(JSON.stringify({
                refresh_token: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN),
                grant_type: 'refresh_token',
                client_id: 'android'
            }))
            .build();


        const response: Response = await this.apiService.fetch(request).toPromise();

        const sessionData: OauthSession = JSON.parse(response.body());

        return {
            ...sessionData,
            userToken: JWTUtil.parseUserTokenFromAccessToken(sessionData.accessToken)
        };
    }

    public async startSession(sessionData: OauthSession): Promise<undefined> {
        localStorage.setItem(ApiKeys.KEY_ACCESS_TOKEN, sessionData.accessToken);
        localStorage.setItem(ApiKeys.KEY_REFRESH_TOKEN, sessionData.refreshToken);
        localStorage.setItem(ApiKeys.KEY_USER_TOKEN, sessionData.userToken);

        return;
    }

    public async endSession(): Promise<undefined> {
        localStorage.removeItem(ApiKeys.KEY_ACCESS_TOKEN);
        localStorage.removeItem(ApiKeys.KEY_REFRESH_TOKEN);
        localStorage.removeItem(ApiKeys.KEY_USER_TOKEN);

        return;
    }

    public getSessionData(): Observable<OauthSession> {
        return Observable.of({
            accessToken: localStorage.getItem(ApiKeys.KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(ApiKeys.KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(ApiKeys.KEY_USER_TOKEN)!
        });
    }
}
