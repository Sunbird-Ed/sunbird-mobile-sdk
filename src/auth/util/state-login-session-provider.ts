import {OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService, HttpRequestType, JWTUtil, Request, Response} from '../../api';
import {StepOneCallbackType} from './o-auth-delegate';
import * as qs from 'qs';

export class StateLoginSessionProvider implements SessionProvider {
    constructor(
        private params: StepOneCallbackType,
        private apiConfig: ApiConfig,
        private apiService: ApiService) {
    }

    public async provide(): Promise<OAuthSession> {
        const id = await this.openInAppBrowser(this.params.ssoUrl!);

        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(`/v1/sso/create/session?id=${id}`)
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

    private async openInAppBrowser(stateUrl: string): Promise<string> {

        const inAppBrowserRef = (<any>window).cordova.InAppBrowser.open(stateUrl, '_blank', 'zoom=no');
        return new Promise<string>((resolve, reject) => {
            const closeCallback = () => {
                reject('state sign in flow canceled');
            };
            inAppBrowserRef.addEventListener('loadstart', (event) => {
                // url - /sso/sign-in/success?id=<id>&redirect_url=<>
                if (event.url) {
                    const id = qs.parse(event.url.split('?')[1]).id;

                    if (id) {
                        resolve(id);
                        inAppBrowserRef.removeEventListener('exit', closeCallback);
                        inAppBrowserRef.close();
                    } else if ((event.url).indexOf('/sso/sign-in/error') !== -1) {
                        reject(new Error('Sign-in error'));
                        inAppBrowserRef.removeEventListener('exit', closeCallback);
                        inAppBrowserRef.close();
                    }
                }
            });
        });
    }
}
