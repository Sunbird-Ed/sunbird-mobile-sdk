import {OauthSession} from './oauth-session';

export interface SessionProvider {

    createSession(args: any): Promise<OauthSession>;

}