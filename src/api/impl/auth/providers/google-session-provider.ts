import {SessionProvider} from '../../../def/auth/providers/session-provider';
import {SessionData} from '../../../def/auth/session-data';

export class GoogleSessionProvider extends SessionProvider {
    public async createSession(accessToken: string, refreshToken: string): Promise<SessionData> {
        const sessionData: SessionData = {
            userToken: this.parseUserTokenFromAccessToken(accessToken),
            accessToken,
            refreshToken
        };

        await this.startSession(sessionData);

        return sessionData;
    }

    refreshSession(): Promise<SessionData> {
        // TODO
        return null as any;
    }

    private parseUserTokenFromAccessToken(accessToken: string): string {
        // TODO
        return '';
    }
}