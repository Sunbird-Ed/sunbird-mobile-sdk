import {ApiConfig, ApiService, JWTUtil} from '../../api';
import {OauthSession} from '..';

declare var customtabs: {
    isAvailable: (success: () => void, error: (error: string) => void) => void;
    launch: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    launchInBrowser: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    close: (success: () => void, error: (error: string) => void) => void;
};

export class OAuthService {
    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService
    ) {
    }

    private static isKeyCloakSignup(params: string): boolean {
        return params.hasOwnProperty('code');
    }

    private static isGoogleSignup(params: string): boolean {
        return (params.indexOf('access_token') !== -1 && params.indexOf('refresh_token') !== -1);
    }

    private static isStateLogin(params: string): boolean {
        return (params.indexOf('ssoUrl') !== -1);
    }

    doOAuthStepOne(): Promise<OauthSession> {
        return new Promise((resolve, reject) => {
            customtabs.isAvailable(() => {
                // customTabs available
                customtabs.launch(this.apiConfig.user_authentication.authUrl, params => {
                    resolve(this.doOAuthStepTwo(params));
                }, error => {
                    reject(error);
                });
            }, () => {
                customtabs.launchInBrowser(this.apiConfig.user_authentication.authUrl, params => {
                    resolve(this.doOAuthStepTwo(params));
                }, error => {
                    reject(error);
                });
            });
        });
    }

    private async doOAuthStepTwo(params: string): Promise<OauthSession> {
        if (OAuthService.isGoogleSignup(params)) {
            // return {
            //     accessToken: this.getQueryParam(params, 'access_token'),
            //     refreshToken: this.getQueryParam(params, 'refresh_token'),
            //     userToken: JWTUtil.parseUserTokenFromAccessToken(this.getQueryParam(params, 'access_token'))
            // };
            throw new Error('to be implemented');
        } else if (OAuthService.isKeyCloakSignup(params)) {
            throw new Error('to be implemented');
        }

        throw new Error('to be implemented');
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
