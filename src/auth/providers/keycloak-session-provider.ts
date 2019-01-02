import {SessionProvider} from '../def/session-provider';
import {OauthSession} from '../def/oauth-session';
import {ApiService, ApiConfig, Request, REQUEST_TYPE, Response, JWTUtil} from '../../api';

export class KeycloakSessionProvider implements SessionProvider {

    constructor(private apiConfig: ApiConfig) {
    }

    public async createSession(accessToken: string): Promise<OauthSession> {

        const request: Request = new Request.Builder().
        withApiToken(false).
        withPath(this.apiConfig.user_authentication.authUrl).
        withType(REQUEST_TYPE.POST).
        withBody(JSON.stringify({
            redirect_uri: this.apiConfig.baseUrl + '/' + this.apiConfig.user_authentication.redirectUrl,
            code: JWTUtil.parseUserTokenFromAccessToken(accessToken),
            grant_type: 'authorization_code',
            client_id: 'android'
        })).build();


        const response: Response = await ApiService.instance.fetch(request);

        const sessionData = JSON.parse(response.response());

        return sessionData;
    }
}