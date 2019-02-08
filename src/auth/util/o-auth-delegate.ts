import {ApiConfig, ApiService} from '../../api';
import {OauthSession} from '..';
import {GoogleSessionProvider} from './google-session-provider';
import {KeycloakSessionProvider} from './keycloak-session-provider';
import * as qs from 'qs';

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

    private static isKeyCloakSignup(paramsObject): boolean {
        return !!paramsObject.code;
    }

    private static isGoogleSignup(paramsObject): boolean {
        return paramsObject.access_token && paramsObject.refresh_token;
    }

    private static isStateLogin(paramsObject): boolean {
        return !!paramsObject.ssoUrl;
    }

    doOAuthStepOne(): Promise<OauthSession> {
        return new Promise((resolve, reject) => {
            const launchUrl = this.apiConfig.host +
                this.apiConfig.user_authentication.authUrl + '/auth' + '?redirect_uri=' +
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
        const paramsObject: { [key: string]: string } = qs.parse(params.split('?')[1]);

        if (OAuthDelegate.isGoogleSignup(paramsObject)) {
            return new GoogleSessionProvider(paramsObject).provide();
        } else if (OAuthDelegate.isKeyCloakSignup(paramsObject)) {
            return new KeycloakSessionProvider(paramsObject, this.apiConfig, this.apiService).provide();
        } else if (OAuthDelegate.isStateLogin(paramsObject)) {
            throw new Error('to be implemented');
        }

        throw new Error('to be implemented');
    }
}
