import { OAuthSession, SessionProvider } from '..';
import { ApiConfig, ApiService } from '../../api';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class StateLoginSessionProvider implements SessionProvider {
    private params;
    private apiConfig;
    private apiService;
    constructor(params: StepOneCallbackType, apiConfig: ApiConfig, apiService: ApiService);
    provide(): Promise<OAuthSession>;
}
