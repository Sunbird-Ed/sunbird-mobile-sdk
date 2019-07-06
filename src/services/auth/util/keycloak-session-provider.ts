import {OAuthSession, SessionProvider, SignInError} from '../index';
import {HttpConfig, HttpRequestType, HttpSerializer, HttpService, JWTUtil, Request, Response} from '../../../native/http';
import {StepOneCallbackType} from './o-auth-delegate';

export class KeycloakSessionProvider implements SessionProvider {
    constructor(private paramsObj: StepOneCallbackType,
                private apiConfig: HttpConfig,
                private apiService: HttpService,
                private inAppBrowserRef: InAppBrowserSession) {
    }

    public async provide(): Promise<OAuthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.apiConfig.user_authentication.authUrl + '/token')
            .withBody({
                redirect_uri: this.apiConfig.host + '/oauth2callback',
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
                if (response.body.access_token && response.body.refresh_token) {
                    const payload: { sub: string } = JWTUtil.getJWTPayload(response.body.access_token);

                    const userToken = payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub;

                    this.inAppBrowserRef.removeEventListener('exit', () => {
                    });
                    this.inAppBrowserRef.close();

                    return {
                        access_token: response.body.access_token,
                        refresh_token: response.body.refresh_token,
                        userToken
                    };
                }

                throw new SignInError('Server Error');
            }).catch(() => {
                throw new SignInError('Server Error');
            });
    }
}
