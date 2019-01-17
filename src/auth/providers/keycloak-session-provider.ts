import {SessionProvider} from '../def/session-provider';
import {OauthSession} from '../def/oauth-session';
import {ApiConfig, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {ApiService} from '../../api/def/api-service';

export class KeycloakSessionProvider implements SessionProvider {

    constructor(private apiConfig: ApiConfig,
                private apiService: ApiService) {
    }

    public async createSession(accessToken: string): Promise<OauthSession> {

        const request: Request = new Request.Builder().
        withApiToken(false).
        withPath(this.apiConfig.user_authentication.authUrl).withType(HttpRequestType.POST).
        withBody(JSON.stringify({
            redirect_uri: this.apiConfig.baseUrl + '/' + this.apiConfig.user_authentication.redirectUrl,
            code: JWTUtil.parseUserTokenFromAccessToken(accessToken),
            grant_type: 'authorization_code',
            client_id: 'android'
        })).build();


        const response: Response = await this.apiService.fetch(request).toPromise();

        const sessionData = response.body();

        return sessionData;
    }
}
