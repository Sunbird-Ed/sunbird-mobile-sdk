import {OauthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {OAuthDelegate} from './o-auth-delegate';

export class OAuthSessionProvider implements SessionProvider {

    private oAuthService: OAuthDelegate;

    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
        this.oAuthService = new OAuthDelegate(this.apiConfig, this.apiService);
    }

    public async provide(): Promise<OauthSession> {
        return this.oAuthService.doOAuthStepOne();
    }
}
