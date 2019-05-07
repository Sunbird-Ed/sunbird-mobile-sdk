import {AuthService, OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {AuthUtil} from '../util/auth-util';
import {Observable} from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';

export class AuthServiceImpl implements AuthService {

    private authUtil: AuthUtil;

    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private sharedPreferences: SharedPreferences,
        private eventsBusService: EventsBusService,
    ) {
        this.authUtil = new AuthUtil(this.apiConfig, this.apiService, this.sharedPreferences, this.eventsBusService);
    }

    setSession(sessionProvider: SessionProvider): Observable<undefined> {
        return Observable.fromPromise(sessionProvider.provide().then((sessionData) => {
            this.authUtil.startSession(sessionData);
            return undefined;
        }));
    }

    getSession(): Observable<OAuthSession | undefined> {
        return Observable.fromPromise(this.authUtil.getSessionData());
    }

    resignSession(): Observable<void> {
        return Observable.fromPromise(this.authUtil.endSession());
    }

    refreshSession(): Observable<void> {
        return Observable.fromPromise(this.authUtil.refreshSession());
    }
}
