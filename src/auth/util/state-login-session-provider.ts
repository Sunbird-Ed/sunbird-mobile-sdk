import {OAuthSession, SessionProvider, SignInError} from '..';
import {ApiConfig, ApiService, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {StepOneCallbackType} from './o-auth-delegate';

export class StateLoginSessionProvider implements SessionProvider {
    constructor(
        private params: StepOneCallbackType,
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private inAppBrowserRef: InAppBrowserSession) {
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
                if (response.body.access_token && response.body.refresh_token) {
                    const jwtPayload: { sub: string } = JWTUtil.getJWTPayload(response.body.access_token);

                    const userToken = jwtPayload.sub.split(':').length === 3 ? <string>jwtPayload.sub.split(':').pop() : jwtPayload.sub;

                    this.inAppBrowserRef.close();

                    return {
                        access_token: response.body.access_token,
                        refresh_token: response.body.refresh_token,
                        userToken
                    };
                }

                throw new SignInError('Server Error');
            })
            .catch(() => {
                throw new SignInError('Server Error');
            });
    }
}
