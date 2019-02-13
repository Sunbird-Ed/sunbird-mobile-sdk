import {OauthSession} from './oauth-session';
import {Observable} from 'rxjs';
import {SessionProvider} from './session-provider';

export interface AuthService {
    setSession(sessionProvider: SessionProvider): Observable<undefined>;

    getSession(): Observable<OauthSession | undefined>;

    resignSession(): Observable<undefined>;

    refreshSession(): Observable<undefined>;
}
