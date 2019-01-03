import {OauthSession} from './oauth-session';

export interface AuthService {

    login(): Promise<OauthSession>;

    logout(): Promise<any>;

    getSession(): Promise<OauthSession>;

}
