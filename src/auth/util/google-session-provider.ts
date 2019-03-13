import {OAuthSession, SessionProvider} from '..';
import {JWTUtil} from '../../api';
import {StepOneCallbackType} from './o-auth-delegate';

export class GoogleSessionProvider implements SessionProvider {
    constructor(private paramsObj: StepOneCallbackType) {
    }

    public async provide(): Promise<OAuthSession> {
        return {
            access_token: this.paramsObj.access_token!,
            refresh_token: this.paramsObj.refresh_token!,
            userToken: JWTUtil.parseUserTokenFromAccessToken(this.paramsObj.access_token!)
        };
    }
}
