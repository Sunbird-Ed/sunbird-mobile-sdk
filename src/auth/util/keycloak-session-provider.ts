import {OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, JWTUtil, Request, Response} from '../../api';
import {StepOneCallbackType} from './o-auth-delegate';

export class KeycloakSessionProvider implements SessionProvider {
    constructor(private paramsObj: StepOneCallbackType,
                private apiConfig: ApiConfig,
                private apiService: ApiService) {
    }

    public async provide(): Promise<OAuthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.apiConfig.user_authentication.authUrl + '/token')
            .withBody({
                redirect_uri: this.apiConfig.user_authentication.redirectUrl,
                code: this.paramsObj.code,
                grant_type: 'authorization_code',
                client_id: 'android'
            })
            .withHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            .withSerializer(HttpSerializer.URLENCODED)
            .withApiToken(false)
            .withSessionToken(false)
            .build();

        return await this.apiService.fetch(apiRequest)
            .toPromise()
            .then((response: Response<{ access_token: string, refresh_token: string }>) => {
                const payload: { sub: string } = JWTUtil.getJWTPayload(response.body.access_token);

                const userToken = payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub;

                return {
                    access_token: response.body.access_token,
                    refresh_token: response.body.refresh_token,
                    userToken
                };
            }).catch(e => {
                console.error(e);

                throw e;
            });
    }
}
