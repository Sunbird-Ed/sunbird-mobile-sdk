import { ApiConfig, ApiService } from '../../api';
import { OAuthSession } from '..';
export interface StepOneCallbackType {
    code?: string;
    access_token?: string;
    refresh_token?: string;
    id?: string;
    googleRedirectUrl?: string;
}
export interface OAuthRedirectUrlQueryParams {
    redirect_uri: string;
    error_callback?: string;
    response_type: string;
    scope: string;
    client_id: string;
    version: string;
}
export declare class OAuthDelegate {
    private apiConfig;
    private apiService;
    constructor(apiConfig: ApiConfig, apiService: ApiService);
    doOAuthStepOne(): Promise<OAuthSession>;
}
