import {
    ApiService,
    Connection,
    HttpRequestType,
    JWTUtil,
    KEY_ACCESS_TOKEN,
    KEY_REFRESH_TOKEN,
    KEY_USER_TOKEN,
    Request,
    Response
} from '../../api';
import {OauthSession} from '..';
import {Observable} from 'rxjs';

export class AuthUtil {

    public static async refreshSession(connection: Connection, authUrl: string): Promise<OauthSession> {

        const request = new Request.Builder()
            .withPath(authUrl)
            .withType(HttpRequestType.POST)
            .withBody(JSON.stringify({
                refresh_token: localStorage.getItem(KEY_REFRESH_TOKEN),
                grant_type: 'refresh_token',
                client_id: 'android'
            }))
            .build();


        const response: Response = await ApiService.instance.fetch(request).toPromise();

        const sessionData: OauthSession = JSON.parse(response.body());

        return {
            ...sessionData,
            userToken: JWTUtil.parseUserTokenFromAccessToken(sessionData.accessToken)
        };
    }

    public static async startSession(sessionData: OauthSession): Promise<undefined> {
        localStorage.setItem(KEY_ACCESS_TOKEN, sessionData.accessToken);
        localStorage.setItem(KEY_REFRESH_TOKEN, sessionData.refreshToken);
        localStorage.setItem(KEY_USER_TOKEN, sessionData.userToken);

        return;
    }

    public static async endSession(): Promise<undefined> {
        localStorage.removeItem(KEY_ACCESS_TOKEN);
        localStorage.removeItem(KEY_REFRESH_TOKEN);
        localStorage.removeItem(KEY_USER_TOKEN);

        return;
    }

    public static getSessionData(): Observable<OauthSession> {
        return Observable.of({
            accessToken: localStorage.getItem(KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(KEY_USER_TOKEN)!
        });
    }
}
