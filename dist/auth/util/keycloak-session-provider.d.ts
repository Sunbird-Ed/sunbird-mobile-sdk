import { OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class KeycloakSessionProvider implements SessionProvider {
    private paramsObj;
    private apiConfig;
    private apiService;
    private inAppBrowserRef;
    constructor(paramsObj: StepOneCallbackType, apiConfig: ApiConfig, apiService: ApiService, inAppBrowserRef: InAppBrowserSession);
    provide(): Promise<OAuthSession>;
}
