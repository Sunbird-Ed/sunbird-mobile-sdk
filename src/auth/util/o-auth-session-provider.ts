import {OauthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {OAuthService} from './o-auth-service';

export class OAuthSessionProvider implements SessionProvider {

    private oAuthService: OAuthService;

    constructor(private apiConfig: ApiConfig, private apiService: ApiService) {
        this.oAuthService = new OAuthService(this.apiConfig, this.apiService);
    }

    public async provide(): Promise<OauthSession> {
        return this.oAuthService.doOAuthStepOne();
    }
}
