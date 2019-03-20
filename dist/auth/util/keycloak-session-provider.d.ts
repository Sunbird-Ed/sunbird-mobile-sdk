import { OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class KeycloakSessionProvider implements SessionProvider {
    private paramsObj;
    private apiConfig;
    private apiService;
    constructor(paramsObj: StepOneCallbackType, apiConfig: ApiConfig, apiService: ApiService);
    provide(): Promise<OAuthSession>;
}
