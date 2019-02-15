import { ApiConfig, ApiService } from '../../api';
import { OauthSession } from '..';
export interface StepOneCallbackType {
    code?: string;
    access_token?: string;
    refresh_token?: string;
    ssoUrl?: string;
}
export declare class OAuthDelegate {
    private apiConfig;
    private apiService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    private static isKeyCloakSignup;
    private static isGoogleSignup;
    private static isStateLogin;
    doOAuthStepOne(): Promise<OauthSession>;
    private doOAuthStepTwo;
}
