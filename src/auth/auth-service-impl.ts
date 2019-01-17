import {AuthService} from './def/auth-service';
import {OauthSession} from './def/oauth-session';
import {ApiConfig} from '../api';
import {OauthHandler} from './handlers/oauth-handler';
import {AuthUtil} from './util/auth-util';
import {Observable} from 'rxjs';
import {ApiService} from '../api/def/api-service';

export class AuthServiceImpl implements AuthService {

    private authUtil: AuthUtil;
    private oauthHandler: OauthHandler

    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
        this.authUtil = new AuthUtil(this.apiService);
        this.oauthHandler = new OauthHandler(this.apiService);
    }

    getSession(): Observable<OauthSession> {
        return this.authUtil.getSessionData();
    }

    login(): Observable<OauthSession> {
        return this.oauthHandler.doLogin(this.apiConfig);
    }

    logout(): Observable<undefined> {
        return this.oauthHandler.doLogout(this.apiConfig);
    }

}
