import {OauthSession, SessionProvider} from '..';
import {JWTUtil} from '../../api';

export class GoogleSessionProvider implements SessionProvider {
    constructor(private params: string) {
    }

    public async provide(): Promise<OauthSession> {
        return {
            accessToken: this.getQueryParam(this.params, 'access_token'),
            refreshToken: this.getQueryParam(this.params, 'refresh_token'),
            userToken: JWTUtil.parseUserTokenFromAccessToken(this.getQueryParam(this.params, 'access_token'))
        };
    }

    private getQueryParam(query: string, param: string): string {
        const paramsArray = query.split('&');
        let paramValue = '';
        paramsArray.forEach((item) => {
            const pair = item.split('=');
            if (pair[0] === param) {
                paramValue = pair[1];
            }
        });
        return paramValue;
    }
}
