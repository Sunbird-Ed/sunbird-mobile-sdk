import { OauthSession } from './oauth-session';
import { Observable } from 'rxjs';
export interface AuthService {
    login(): Observable<OauthSession>;
    logout(): Observable<undefined>;
    getSession(): Observable<OauthSession>;
}
