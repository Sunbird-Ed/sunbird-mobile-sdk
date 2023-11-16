import {AuthService, OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {AuthUtil} from '../util/auth-util';
import {combineLatest, defer, EMPTY, from, fromEvent, merge, Observable} from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {distinctUntilChanged, map, mapTo, mergeMap} from 'rxjs/operators';
import {CsModule} from '@project-sunbird/client-services';
import {AuthKeys, ProfileKeys} from '../../preference-keys';
import {ProfileSession} from '../../profile';

@injectable()
export class AuthServiceImpl implements AuthService {
    private static readonly ACCESS_TOKEN_NEARING_EXPIRY_DELTA = 1000 * 60 * 60;
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
            console.log("addListener(AuthKeys.KEY_OAUTH_SESSION) 1 ", value)
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
            console.log("addListener(AuthKeys.KEY_OAUTH_SESSION) 2 ", value)
            if (value) {
                try {
                    const profileSession: ProfileSession = JSON.parse(value);
                    let val = (await this.sharedPreferences.getString(AuthKeys.KEY_OAUTH_SESSION).toPromise());
                    console.log('val for get string after 2 ', val);
                    const authSession: OAuthSession = JSON.parse(val!);
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

        return combineLatest([
          defer(() => this.getSession()).pipe(
            mergeMap(async (session) => {
                if (!session) {
                    return undefined;
                }
                let val = (await this.sharedPreferences.getString(ProfileKeys.KEY_USER_SESSION).toPromise());
                console.log('val before parse ', val);
                const profileSession: ProfileSession = JSON.parse(val!);
                console.log("profilesession ", profileSession);
                CsModule.instance.config.core.api.authentication.userToken = session.access_token;
                CsModule.instance.config.core.api.authentication.managedUserToken = profileSession.managedSession ? session.managed_access_token : undefined;
                CsModule.instance.updateConfig(CsModule.instance.config);

                return undefined;
            })
          ),
          defer(() => this.onAccessTokenNearingExpiry()).pipe(
            mergeMap(async (shouldRefresh) => {
                if (shouldRefresh) {
                    return this.refreshSession().toPromise();
                }

                return undefined;
            })
          )
        ]).pipe(
          mapTo(undefined)
        );
    }

    setSession(sessionProvider: SessionProvider): Observable<undefined> {
        return from(sessionProvider.provide().then(async (sessionData) => {
            console.log('setssion session data ', sessionData);
            if (!sessionData.access_token) {
                await this.authUtil.endSession();
                throw sessionData;
            }
            await this.authUtil.startSession(sessionData);
            await this.authUtil.refreshSession();
            return undefined;
        }).catch(e => {
            console.log('e ', e);
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

    onAccessTokenNearingExpiry(): Observable<boolean> {
        const initialSession$ = defer(() => this.getSession());
        const consecutiveSession$ = new Observable((observer) => {
            document.addEventListener('resume', () => {
                setTimeout(() => {
                    observer.next();
                }, 0);
            }, false);
        }).pipe(
          mergeMap(() => this.getSession())
        );

        return merge(
          initialSession$,
          consecutiveSession$
        ).pipe(
          map((session) => {
              if (!session || !session.accessTokenExpiresOn) {
                  return false;
              }

              return session.accessTokenExpiresOn - Date.now() < AuthServiceImpl.ACCESS_TOKEN_NEARING_EXPIRY_DELTA;
          }),
          distinctUntilChanged()
        );
    }
}
