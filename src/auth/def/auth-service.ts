import {OAuthSession} from './o-auth-session';
import {Observable} from 'rxjs';
import {SessionProvider} from './session-provider';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';

export interface AuthService extends SdkServiceOnInitDelegate {
    setSession(sessionProvider: SessionProvider): Observable<undefined>;

    getSession(): Observable<OAuthSession | undefined>;

    resignSession(): Observable<void>;

    refreshSession(): Observable<void>;
}
