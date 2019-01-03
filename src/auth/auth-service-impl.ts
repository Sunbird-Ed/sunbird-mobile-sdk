import {AuthService} from './def/auth-service';
import {OauthSession} from './def/oauth-session';
import {ApiConfig} from '../api';
import {OauthHandler} from './handlers/oauth-handler';
import {AuthUtil} from './util/auth-util';

export class AuthServiceImpl implements AuthService {

    constructor(private apiConfig: ApiConfig) {

    }

    getSession(): Promise<OauthSession> {
        return AuthUtil.getSessionData();
    }

    login(): Promise<OauthSession> {
        return OauthHandler.doLogin(this.apiConfig);
    }

    logout(): Promise<any> {
        return OauthHandler.doLogout(this.apiConfig);
    }

}
