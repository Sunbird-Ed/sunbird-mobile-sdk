import {ApiConfig} from '../../api';
import {GoogleSessionProvider} from '../providers/google-session-provider';
import {AuthUtil} from '../util/auth-util';
import {OauthSession} from '..';
import {KeycloakSessionProvider} from '../providers/keycloak-session-provider';
import {Observable, Observer} from 'rxjs';

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

    public static doLogin(apiConfig: ApiConfig): Observable<OauthSession> {
        return Observable.create((observer: Observer<OauthSession>) => {
            customtabs.isAvailable(async () => {
                customtabs.launch(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    observer.next(await OauthHandler.resolveTokens(callbackUrl, apiConfig));
                    observer.complete();
                }, error => {
                    observer.error(error);
                });
            }, () => {
                customtabs.launchInBrowser(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    observer.next(await OauthHandler.resolveTokens(callbackUrl, apiConfig));
                }, error => {
                    observer.error(error);
                });
            });
        });
    }

    public static doLogout(apiConfig: ApiConfig): Observable<undefined> {
        return Observable.create((observer: Observer<undefined>) => {
            customtabs.isAvailable(() => {
                customtabs.launch(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await AuthUtil.endSession();
                    observer.next(undefined);
                    observer.complete();
                }, error => {
                    observer.error(error);
                });
            }, error => {
                customtabs.launchInBrowser(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await AuthUtil.endSession();
                    observer.next(undefined);
                    observer.complete();
                }, e => {
                    observer.error(error);
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
            return AuthUtil.getSessionData().toPromise();
        } else {
            const keycloakSessionProvider = new KeycloakSessionProvider(apiConfig);
            await keycloakSessionProvider.createSession(params.get('access_token')!);
            return AuthUtil.getSessionData().toPromise();
        }
    }
}
