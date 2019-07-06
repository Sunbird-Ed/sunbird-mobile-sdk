import {OAuthSession, SessionProvider} from '../index';
import {HttpConfig, HttpService} from '../../../native/http';
import {OAuthDelegate} from './o-auth-delegate';

export class OAuthSessionProvider implements SessionProvider {

    private oAuthService: OAuthDelegate;

    constructor(private apiConfig: HttpConfig, private apiService: HttpService) {
        this.oAuthService = new OAuthDelegate(this.apiConfig, this.apiService);
    }

    public async provide(): Promise<OAuthSession> {
        return this.oAuthService.doOAuthStepOne();
    }
}
