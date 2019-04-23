import {ApiConfig, ApiService} from '../../api';
import {KeycloakSessionProvider} from './keycloak-session-provider';
import {StateLoginSessionProvider} from './state-login-session-provider';
import * as qs from 'qs';
import {StepOneCallbackType} from './o-auth-delegate';
import {GoogleSessionProvider} from './google-session-provider';
import {SessionProvider} from '..';

export class SunbirdOAuthSessionProviderFactory {
    constructor(private apiConfig: ApiConfig, private apiService: ApiService, private inAppBrowserRef: InAppBrowserSession) {
    }

    private static isKeyCloakLogin(paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.code;
    }

    private static isGoogleLogin(paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.googleRedirectUrl;
    }

    private static isStateLogin(paramsObject: StepOneCallbackType): boolean {
        return !!paramsObject.id;
    }

    public fromUrl(url: string): SessionProvider | undefined {
        const params = qs.parse(url.substring(url.indexOf('?') + 1));

        if (SunbirdOAuthSessionProviderFactory.isGoogleLogin(params)) {
            return new GoogleSessionProvider(params, this.apiConfig, this.inAppBrowserRef);
        } else if (SunbirdOAuthSessionProviderFactory.isKeyCloakLogin(params)) {
            return new KeycloakSessionProvider(params, this.apiConfig, this.apiService, this.inAppBrowserRef);
        } else if (SunbirdOAuthSessionProviderFactory.isStateLogin(params)) {
            return new StateLoginSessionProvider(params, this.apiConfig, this.apiService);
        }
    }
}
