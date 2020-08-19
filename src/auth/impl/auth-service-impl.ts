import {AuthService, OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {AuthUtil} from '../util/auth-util';
import {from, Observable} from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {mergeMap} from 'rxjs/operators';
import {CsModule} from '@project-sunbird/client-services';
import {AuthKeys, ProfileKeys} from '../../preference-keys';
import {ProfileSession} from '../../profile';

@injectable()
export class AuthServiceImpl implements AuthService {

    private authUtil: AuthUtil;
    private apiConfig: ApiConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;
        this.authUtil = new AuthUtil(this.apiConfig, this.apiService, this.sharedPreferences, this.eventsBusService);
    }

    onInit(): Observable<undefined> {
        this.sharedPreferences.addListener(AuthKeys.KEY_OAUTH_SESSION, async (value) => {
            if (value) {
                try {
                    const profileSession: ProfileSession = JSON.parse((await this.sharedPreferences.getString(ProfileKeys.KEY_USER_SESSION).toPromise())!);
                    const authSession: OAuthSession = JSON.parse(value);
                    CsModule.instance.config.core.api.authentication.userToken = authSession.access_token;
                    CsModule.instance.config.core.api.authentication.managedUserToken = profileSession.managedSession ? authSession.managed_access_token : undefined;
                } catch (e) {
                    console.error(e);
                    CsModule.instance.config.core.api.authentication.userToken = undefined;
                    CsModule.instance.config.core.api.authentication.managedUserToken = undefined;
                }
            } else {
                CsModule.instance.config.core.api.authentication.userToken = undefined;
                CsModule.instance.config.core.api.authentication.managedUserToken = undefined;
            }

            CsModule.instance.updateConfig(CsModule.instance.config);
        });

        this.sharedPreferences.addListener(ProfileKeys.KEY_USER_SESSION, async (value) => {
            if (value) {
                try {
                    const profileSession: ProfileSession = JSON.parse(value);
                    const authSession: OAuthSession = JSON.parse((await this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION).toPromise())!);
                    CsModule.instance.config.core.api.authentication.userToken = authSession.access_token;
                    CsModule.instance.config.core.api.authentication.managedUserToken = profileSession.managedSession ? authSession.managed_access_token : undefined;
                } catch (e) {
                    console.error(e);
                    CsModule.instance.config.core.api.authentication.userToken = undefined;
                    CsModule.instance.config.core.api.authentication.managedUserToken = undefined;
                }
            } else {
                CsModule.instance.config.core.api.authentication.userToken = undefined;
                CsModule.instance.config.core.api.authentication.managedUserToken = undefined;
            }

            CsModule.instance.updateConfig(CsModule.instance.config);
        });

        return this.getSession().pipe(
            mergeMap(async (session) => {
                if (!session) {
                    return undefined;
                }

                const profileSession: ProfileSession = JSON.parse((await this.sharedPreferences.getString(ProfileKeys.KEY_USER_SESSION).toPromise())!);
                CsModule.instance.config.core.api.authentication.userToken = session.access_token;
                CsModule.instance.config.core.api.authentication.managedUserToken = profileSession.managedSession ? session.managed_access_token : undefined;
                CsModule.instance.updateConfig(CsModule.instance.config);

                return undefined;
            })
        );
    }

    setSession(sessionProvider: SessionProvider): Observable<undefined> {
        return from(sessionProvider.provide().then((sessionData) => {
            this.authUtil.startSession(sessionData);
            return undefined;
        }));
    }

    getSession(): Observable<OAuthSession | undefined> {
        return from(this.authUtil.getSessionData());
    }

    resignSession(): Observable<void> {
        return from(this.authUtil.endSession());
    }

    refreshSession(): Observable<void> {
        return from(this.authUtil.refreshSession());
    }
}
