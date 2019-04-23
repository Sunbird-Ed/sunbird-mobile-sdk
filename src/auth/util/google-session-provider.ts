import {OAuthSession, SessionProvider} from '..';
import {ApiConfig, JWTUtil} from '../../api';
import {OAuthRedirectUrlQueryParams, StepOneCallbackType} from './o-auth-delegate';
import * as qs from 'qs';
import {SignInError} from '../errors/sign-in-error';

export class GoogleSessionProvider implements SessionProvider {
    constructor(private paramsObj: StepOneCallbackType,
                private apiConfig: ApiConfig,
                private inAppBrowserRef: InAppBrowserSession) {
    }

    private static async parseResolvedParams(params): Promise<OAuthSession> {
        const paramsObject: StepOneCallbackType = qs.parse(params.split('?')[1] || {});

        if (paramsObject.access_token && paramsObject.refresh_token) {
            const jwtPayload: { sub: string } = JWTUtil.getJWTPayload(paramsObject.access_token);

            const userToken = jwtPayload.sub.split(':').length === 3 ? <string>jwtPayload.sub.split(':').pop() : jwtPayload.sub;

            return {
                access_token: paramsObject.access_token,
                refresh_token: paramsObject.refresh_token,
                userToken
            };
        } else if (paramsObject.error_message) {
            throw new SignInError(paramsObject.error_message);
        }

        throw new SignInError('Server Error');
    }

    public async provide(): Promise<OAuthSession> {
        this.inAppBrowserRef.close();

        const sanitizedGoogleUrl = this.paramsObj.googleRedirectUrl!.substring(0, this.paramsObj.googleRedirectUrl!.indexOf('?'));

        const googleRedirectUrlQueryParams: OAuthRedirectUrlQueryParams = {
            redirect_uri: this.apiConfig.user_authentication.redirectUrl,
            error_callback: this.apiConfig.user_authentication.redirectUrl,
            response_type: 'code',
            scope: 'offline_access',
            client_id: 'android',
            version: '3'
        };

        return this.openInCustomTabs(sanitizedGoogleUrl + '?' + qs.stringify(googleRedirectUrlQueryParams, {encode: true}));
    }

    private async openInCustomTabs(googleUrl: string): Promise<OAuthSession> {
        return new Promise<OAuthSession>((resolve, reject) => {
            customtabs.isAvailable(() => {
                // customTabs available
                customtabs.launch(googleUrl, params => {
                    GoogleSessionProvider.parseResolvedParams(params)
                        .then((r) => resolve(r))
                        .catch((r) => reject(r));
                }, error => {
                    reject(error);
                });
            }, () => {
                customtabs.launchInBrowser(googleUrl, params => {
                    GoogleSessionProvider.parseResolvedParams(params)
                        .then((r) => resolve(r))
                        .catch((r) => reject(r));
                }, error => {
                    reject(error);
                });
            });
        });
    }
}
