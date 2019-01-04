import {AuthService} from './def/auth-service';
import {OauthSession} from './def/oauth-session';
import {ApiConfig} from '../api';
import {OauthHandler} from './handlers/oauth-handler';
import {AuthUtil} from './util/auth-util';
import {Observable} from 'rxjs';

export class AuthServiceImpl implements AuthService {

    constructor(private apiConfig: ApiConfig) {

    }

    getSession(): Observable<OauthSession> {
        return AuthUtil.getSessionData();
    }

    login(): Observable<OauthSession> {
        return OauthHandler.doLogin(this.apiConfig);
    }

    logout(): Observable<undefined> {
        return OauthHandler.doLogout(this.apiConfig);
    }

}
