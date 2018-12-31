import {UserAuthService} from '../../def/auth/user-auth-Service';
import {ApiConfig, Connection, KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN, KEY_USER_TOKEN} from '../..';
import {SessionData} from '../../def/auth/session-data';

export class MobileUserAuthService implements UserAuthService {
    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    refreshSession(connection: Connection): Promise<SessionData> {
        return new Promise<SessionData>((resolve, reject) => {
            // TODO
        });
    }

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

    public async getSessionData(): Promise<SessionData> {
        return {
            accessToken: localStorage.getItem(KEY_ACCESS_TOKEN)!,
            refreshToken: localStorage.getItem(KEY_REFRESH_TOKEN)!,
            userToken: localStorage.getItem(KEY_USER_TOKEN)!
        }
    }
}