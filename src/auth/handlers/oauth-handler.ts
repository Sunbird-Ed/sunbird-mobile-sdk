import {ApiConfig} from '../../api';
import {GoogleSessionProvider} from '../providers/google-session-provider';
import {AuthUtil} from '../util/auth-util';
import {OauthSession} from '..';
import {KeycloakSessionProvider} from '../providers/keycloak-session-provider';
import {Observable, Observer} from 'rxjs';
import {ApiService} from '../../api/def/api-service';

declare var customtabs: {
    isAvailable: (success: () => void, error: (error: string) => void) => void;
    launch: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    launchInBrowser: (url: string, success: (callbackUrl: string) => void, error: (error: string) => void) => void;
    close: (success: () => void, error: (error: string) => void) => void;
};

export class OauthHandler {
    private authUtil: AuthUtil;

    constructor(private apiService: ApiService) {
        this.authUtil = new AuthUtil(this.apiService);
    }

    public doLogin(apiConfig: ApiConfig): Observable<OauthSession> {
        return Observable.create((observer: Observer<OauthSession>) => {
            customtabs.isAvailable(async () => {
                customtabs.launch(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    observer.next(await this.resolveTokens(callbackUrl, apiConfig));
                    observer.complete();
                }, error => {
                    observer.error(error);
                });
            }, () => {
                customtabs.launchInBrowser(apiConfig.user_authentication.authUrl, async callbackUrl => {
                    observer.next(await this.resolveTokens(callbackUrl, apiConfig));
                }, error => {
                    observer.error(error);
                });
            });
        });
    }

    public doLogout(apiConfig: ApiConfig): Observable<undefined> {
        return Observable.create((observer: Observer<undefined>) => {
            customtabs.isAvailable(() => {
                customtabs.launch(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await this.authUtil.endSession();
                    observer.next(undefined);
                    observer.complete();
                }, error => {
                    observer.error(error);
                });
            }, error => {
                customtabs.launchInBrowser(apiConfig.user_authentication.logoutUrl!!, async () => {
                    await this.authUtil.endSession();
                    observer.next(undefined);
                    observer.complete();
                }, e => {
                    observer.error(error);
                });
            });
        });
    }

    private isGoogleSignupCallBackUrl(url: string): boolean {
        return (url.indexOf('access_token') !== -1 && url.indexOf('refresh_token') !== -1);
    }

    private async resolveTokens(url: string, apiConfig: ApiConfig): Promise<OauthSession> {
        const params = (new URL(url)).searchParams;

        if (!params) {
            throw new Error('Unable to Authenticate, no params found');
        }

        if (this.isGoogleSignupCallBackUrl(url)) {
            const googleSessionProvider = new GoogleSessionProvider();
            await googleSessionProvider.createSession({
                accessToken: params.get('access_token')!,
                refreshToken: params.get('refresh_token')!
            });
            return this.authUtil.getSessionData().toPromise();
        } else {
            const keycloakSessionProvider = new KeycloakSessionProvider(apiConfig, this.apiService);
            await keycloakSessionProvider.createSession(params.get('access_token')!);
            return this.authUtil.getSessionData().toPromise();
        }
    }
}
