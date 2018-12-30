import {SessionData} from '../session-data';
import {KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN, KEY_USER_TOKEN} from '../../constants';

export abstract class SessionProvider {
    abstract createSession(accessToken: string, refreshToken?: string): Promise<SessionData>;

    abstract refreshSession(): Promise<SessionData>;

    public async startSession(sessionData: SessionData): Promise<undefined> {
        localStorage.setItem(KEY_ACCESS_TOKEN, sessionData.accessToken);
        localStorage.setItem(KEY_REFRESH_TOKEN, sessionData.refreshToken);
        localStorage.setItem(KEY_USER_TOKEN, sessionData.userToken);

        return;
    }

    public async endSession(): Promise<undefined> {
        localStorage.removeItem(KEY_ACCESS_TOKEN);
        localStorage.removeItem(KEY_REFRESH_TOKEN);
        localStorage.removeItem(KEY_USER_TOKEN);

        return;
    }

    public async getSession(): Promise<SessionData> {
        return {
            accessToken: localStorage.getItem(KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(KEY_USER_TOKEN)!
        }
    }
}