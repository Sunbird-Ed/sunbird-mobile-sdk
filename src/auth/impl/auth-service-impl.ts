import {AuthService, OauthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {AuthUtil} from '../util/auth-util';
import {Observable} from 'rxjs';

export class AuthServiceImpl implements AuthService {

    private authUtil: AuthUtil;

    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
        this.authUtil = new AuthUtil(this.apiConfig, this.apiService);
    }

    setSession(sessionProvider: SessionProvider): Observable<undefined> {
        return Observable.fromPromise(sessionProvider.provide().then((sessionData) => {
            this.authUtil.startSession(sessionData);
            return undefined;
        }));
    }

    getSession(): Observable<OauthSession> {
        return Observable.fromPromise(this.authUtil.getSessionData());
    }

    resignSession(): Observable<undefined> {
        this.authUtil.endSession();

        return Observable.of(undefined);
    }

    refreshSession(): Observable<undefined> {
        return Observable.fromPromise(this.authUtil.refreshSession());
    }
}
