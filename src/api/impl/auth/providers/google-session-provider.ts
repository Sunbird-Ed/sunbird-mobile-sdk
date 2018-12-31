import {SessionProvider} from '../../../def/auth/providers/session-provider';
import {SessionData} from '../../../def/auth/session-data';
import {JWTUtil} from '../../../util/jwt/jwt.util';

export class GoogleSessionProvider implements SessionProvider {
    public async createSession(accessToken: string, refreshToken: string): Promise<SessionData> {
        const sessionData: SessionData = {
            userToken: JWTUtil.parseUserTokenFromAccessToken(accessToken),
            accessToken,
            refreshToken
        };

        return sessionData;
    }
}