import {ApiConfig} from '../../api';
import {GoogleSessionProvider} from '../providers/google-session-provider';
import {AuthUtil} from '../util/auth-util';
import {OauthSession} from '..';
import {KeycloakSessionProvider} from '../providers/keycloak-session-provider';

declare var customtabs: {
    isAvailable: (success: () => void, error: (error: string) => void) => void;
    launch: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    launchInBrowser: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    close: (success: () => void, error: (error: string) => void) => void;
};

export class OauthHandler {


    private static isGoogleSignupCallBackUrl(url: string): boolean {
        return (url.indexOf('access_token') !== -1 && url.indexOf('refresh_token') !== -1);
    }

    public static async doLogin(apiConfig: ApiConfig): Promise<OauthSession> {
        return new Promise<OauthSession>((resolve, reject) => {
            customtabs.isAvailable(() => {
                customtabs.launch(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    resolve(OauthHandler.resolveTokens(callbackUrl, apiConfig));
                }, error => {
                    reject(error);
                });
            }, () => {
                customtabs.launchInBrowser(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    resolve(OauthHandler.resolveTokens(callbackUrl, apiConfig));
                }, error => {
                    reject(error);
                });
            });
        });
    }

    public static async doLogout(apiConfig: ApiConfig) {
        return new Promise((resolve, reject) => {
            customtabs.isAvailable(() => {
                customtabs.launch(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await AuthUtil.endSession();
                    resolve();
                }, error => {
                    reject(error);
                });
            }, error => {
                customtabs.launchInBrowser(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await AuthUtil.endSession();
                    resolve();
                }, e => {
                    reject(e);
                });
            });
        });
    }

    private static async resolveTokens(url: string, apiConfig: ApiConfig): Promise<OauthSession> {
        const params = (new URL(url)).searchParams;

        if (!params) {
            throw new Error('Unable to Authenticate, no params found');
        }

        if (OauthHandler.isGoogleSignupCallBackUrl(url)) {
            const googleSessionProvider = new GoogleSessionProvider();
            await googleSessionProvider.createSession({
                accessToken: params.get('access_token')!,
                refreshToken: params.get('refresh_token')!
            });
            return AuthUtil.getSessionData();
        } else {
            const keycloakSessionProvider = new KeycloakSessionProvider(apiConfig);
            await keycloakSessionProvider.createSession(params.get('access_token')!);
            return AuthUtil.getSessionData();
        }
    }
}
