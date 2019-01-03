import {SessionProvider} from '../def/session-provider';
import {OauthSession} from '../def/oauth-session';
import {JWTUtil} from '../../api';

export class GoogleSessionProvider implements SessionProvider {

    public async createSession(args: any): Promise<OauthSession> {
        const sessionData: OauthSession = {
            userToken: JWTUtil.parseUserTokenFromAccessToken(args.accessToken),
            accessToken: args.accessToken,
            refreshToken: args.refreshToken
        };

        return sessionData;
    }
}