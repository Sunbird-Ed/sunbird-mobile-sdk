import {UserAuthService} from '../../def/auth/user-auth-Service';
import {
    ApiConfig,
    ApiSdk,
    Connection,
    KEY_ACCESS_TOKEN,
    KEY_REFRESH_TOKEN,
    KEY_USER_TOKEN,
    Request,
    REQUEST_TYPE,
    Response
} from '../..';
import {SessionData} from '../../def/auth/session-data';
import {JWTUtil} from '../../util/jwt/jwt.util';

export class MobileUserAuthService implements UserAuthService {
    private config: ApiConfig;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    public async refreshSession(connection: Connection): Promise<SessionData> {
        const response: Response = await ApiSdk.instance.fetch(new Request(
            this.config.user_authentication.authUrl,
            REQUEST_TYPE.POST,
            null,
            JSON.stringify({
                refresh_token: localStorage.getItem(KEY_REFRESH_TOKEN),
                grant_type: 'refresh_token',
                client_id: 'android'
            }))
        );

        const sessionData: SessionData = JSON.parse(response.response())

        return {
            ...sessionData,
            userToken: JWTUtil.parseUserTokenFromAccessToken(sessionData.accessToken)
        };
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