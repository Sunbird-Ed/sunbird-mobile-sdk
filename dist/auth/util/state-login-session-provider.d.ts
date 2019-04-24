import { OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class StateLoginSessionProvider implements SessionProvider {
    private params;
    private apiConfig;
    private apiService;
    private inAppBrowserRef;
    constructor(params: StepOneCallbackType, apiConfig: ApiConfig, apiService: ApiService, inAppBrowserRef: InAppBrowserSession);
    provide(): Promise<OAuthSession>;
}
