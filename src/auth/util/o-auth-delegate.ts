import {ApiConfig, ApiService} from '../../api';
import {OauthSession} from '..';
import {GoogleSessionProvider} from './google-session-provider';
import {KeycloakSessionProvider} from './keycloak-session-provider';

declare var customtabs: {
    isAvailable: (success: () => void, error: (error: string) => void) => void;
    launch: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    launchInBrowser: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    close: (success: () => void, error: (error: string) => void) => void;
};

export class OAuthDelegate {
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
            const launchUrl = this.apiConfig.host +
                this.apiConfig.user_authentication.authUrl + '?redirect_uri=' +
                this.apiConfig.user_authentication.redirectUrl + '&response_type=code&scope=offline_access&client_id=android&version=2';

            customtabs.isAvailable(() => {
                // customTabs available
                // https://staging.ntp.net.in/auth/realms/sunbird/protocol/openid-connect/auth?redirect_uri=staging.diksha.app://mobile&response_type=code&scope=offline_access&client_id=android&version=1
                customtabs.launch(launchUrl, params => {
                    resolve(this.doOAuthStepTwo(params));
                }, error => {
                    reject(error);
                });
            }, () => {
                customtabs.launchInBrowser(launchUrl, params => {
                    resolve(this.doOAuthStepTwo(params));
                }, error => {
                    reject(error);
                });
            });
        });
    }

    private async doOAuthStepTwo(params: string): Promise<OauthSession> {
        if (OAuthDelegate.isGoogleSignup(params)) {
            return new GoogleSessionProvider(params).provide();
        } else if (OAuthDelegate.isKeyCloakSignup(params)) {
            return new KeycloakSessionProvider(params, this.apiConfig, this.apiService).provide();
        } else if (OAuthDelegate.isStateLogin(params)) {
            throw new Error('to be implemented');
        }

        throw new Error('to be implemented');
    }
}
