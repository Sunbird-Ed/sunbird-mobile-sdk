import {SessionProvider} from '../../../def/auth/providers/session-provider';
import {SessionData} from '../../../def/auth/session-data';

export class GoogleSessionProvider implements SessionProvider {
    public async createSession(accessToken: string, refreshToken: string): Promise<SessionData> {
        const sessionData: SessionData = {
            userToken: this.parseUserTokenFromAccessToken(accessToken),
            accessToken,
            refreshToken
        };

        return sessionData;
    }

    private parseUserTokenFromAccessToken(accessToken: string): string {
        // TODO
        return '';
    }
}