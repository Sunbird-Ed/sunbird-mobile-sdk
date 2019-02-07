import {OauthSession, SessionProvider} from '..';
import {ApiConfig, ApiService, HttpRequestType, JWTUtil, Request, Response} from '../../api';

export class KeycloakSessionProvider implements SessionProvider {
    constructor(private params: string,
                private apiConfig: ApiConfig,
                private apiService: ApiService) {
    }

    public async provide(): Promise<OauthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.apiConfig.host + this.apiConfig.user_authentication.authUrl)
            .withBody({
                redirect_uri: this.apiConfig.host + this.apiConfig.user_authentication.redirectUrl,
                code: this.getQueryParam(this.params, 'code'),
                grant_type: 'authorization_code',
                client_id: 'android'
            })
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
            });
    }

    private getQueryParam(query: string, param: string): string {
        const paramsArray = query.split('&');
        let paramValue = '';
        paramsArray.forEach((item) => {
            const pair = item.split('=');
            if (pair[0] === param) {
                paramValue = pair[1];
            }
        });
        return paramValue;
    }
}
