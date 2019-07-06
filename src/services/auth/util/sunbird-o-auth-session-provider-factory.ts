import {ApiConfig, HttpService} from '../../../native/http';
import {KeycloakSessionProvider} from './keycloak-session-provider';
import {StateLoginSessionProvider} from './state-login-session-provider';
import * as qs from 'qs';
import {StepOneCallbackType} from './o-auth-delegate';
import {GoogleSessionProvider} from './google-session-provider';
import {SessionProvider} from '../index';

export class SunbirdOAuthSessionProviderFactory {
    constructor(private apiConfig: ApiConfig, private apiService: HttpService, private inAppBrowserRef: InAppBrowserSession) {
    }

    public fromUrl(url: string): SessionProvider | undefined {
        const params = qs.parse(url.substring(url.indexOf('?') + 1));

        if (this.isGoogleLogin(url, params)) {
            return new GoogleSessionProvider(params, this.apiConfig, this.inAppBrowserRef);
        } else if (this.isKeyCloakLogin(url, params)) {
            return new KeycloakSessionProvider(params, this.apiConfig, this.apiService, this.inAppBrowserRef);
        } else if (this.isStateLogin(url, params)) {
            return new StateLoginSessionProvider(params, this.apiConfig, this.apiService, this.inAppBrowserRef);
        }
    }

    private isKeyCloakLogin(url: string, paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.code && url.startsWith(`${this.apiConfig.host}/oauth2callback`);
    }

    private isGoogleLogin(url: string, paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.googleRedirectUrl && url.startsWith(`${this.apiConfig.host}/oauth2callback`);
    }

    private isStateLogin(url: string, paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.id && url.startsWith(`${this.apiConfig.host}/sso/sign-in/success`);
    }
}
