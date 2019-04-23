import {OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {StepOneCallbackType} from './o-auth-delegate';

export class StateLoginSessionProvider implements SessionProvider {
    constructor(
        private params: StepOneCallbackType,
        private apiConfig: ApiConfig,
        private apiService: ApiService) {
    }

    public async provide(): Promise<OAuthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(`/v1/sso/create/session?id=${this.params.id}`)
            .withSessionToken(false)
            .withApiToken(false)
            .build();

        return this.apiService.fetch(apiRequest)
            .toPromise()
            .then((response: Response<{ access_token: string, refresh_token: string }>) => {
                    return {
                        access_token: response.body.access_token,
                        refresh_token: response.body.refresh_token,
                        userToken: JWTUtil.parseUserTokenFromAccessToken(response.body.access_token)
                    };
                }
            );
    }
}
