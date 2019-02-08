import {OauthSession, SessionProvider} from '..';
import {JWTUtil} from '../../api';

export class GoogleSessionProvider implements SessionProvider {
    constructor(private paramsObj: { [key: string]: string }) {
    }

    public async provide(): Promise<OauthSession> {
        return {
            accessToken: this.paramsObj.access_token,
            refreshToken: this.paramsObj.refresh_token,
            userToken: JWTUtil.parseUserTokenFromAccessToken(this.paramsObj.access_token)
        };
    }
}
