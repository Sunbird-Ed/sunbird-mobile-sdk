import {OauthSession, SessionProvider} from '..';
import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response} from '../../api';

export class KeycloakSessionProvider implements SessionProvider {
    constructor(private paramsObj: { [key: string]: string },
                private apiConfig: ApiConfig,
                private apiService: ApiService) {
    }

    public async provide(): Promise<OauthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.apiConfig.host + this.apiConfig.user_authentication.authUrl + '/token')
            .withBody({
                redirect_uri: this.apiConfig.user_authentication.redirectUrl,
                code: this.paramsObj.code,
                grant_type: 'authorization_code',
                client_id: 'android'
            })
            .withSerializer(HttpSerializer.URLENCODED)
            .withApiToken(false)
            .withSessionToken(false)
            .build();

        return await this.apiService.fetch(apiRequest)
            .toPromise()
            .then((response: Response<{ access_token: string, refresh_token: string }>) => {
                return {
                    accessToken: response.body.access_token,
                    refreshToken: response.body.refresh_token,
                    userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.access_token)
                };
            }).catch(e => {
                console.log(e);

                throw e;
            });
    }
}
