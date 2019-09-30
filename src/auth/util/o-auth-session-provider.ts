import {OAuthSession, SessionProvider} from '..';
import {ApiConfig, ApiService} from '../../api';
import {OAuthDelegate} from './o-auth-delegate';
import {SunbirdSdk} from "../../sdk";

export class OAuthSessionProvider implements SessionProvider {
    private oAuthService: OAuthDelegate;

    constructor(private apiConfig: ApiConfig, private apiService: ApiService, mode: 'default' | 'merge' = 'default') {
        this.oAuthService = new OAuthDelegate(this.apiConfig, this.apiService, SunbirdSdk.instance.eventsBusService, mode);
    }

    public async provide(): Promise<OAuthSession> {
        return this.oAuthService.doOAuthStepOne();
    }
}
