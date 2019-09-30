import { ApiConfig, ApiService } from '../../api';
import { OAuthSession } from '..';
import { SunbirdError } from '../../sunbird-error';
import { EventsBusService } from "../../events-bus";
export interface StepOneCallbackType {
    code?: string;
    access_token?: string;
    refresh_token?: string;
    id?: string;
    googleRedirectUrl?: string;
    error_message?: string;
    automerge?: string;
    payload?: string;
}
export interface OAuthRedirectUrlQueryParams {
    redirect_uri: string;
    error_callback?: string;
    response_type: string;
    scope: string;
    client_id: string;
    version: string;
    goBackUrl?: string;
    merge_account_process?: string;
    mergeaccountprocess?: string;
}
export declare class ForgotPasswordFlowDetectedError extends SunbirdError {
    constructor(message: string);
}
export declare class OAuthDelegate {
    private apiConfig;
    private apiService;
    private eventsBusService;
    private mode;
    private autoMergeContext?;
    constructor(apiConfig: ApiConfig, apiService: ApiService, eventsBusService: EventsBusService, mode: 'default' | 'merge');
    readonly exitUrl: string;
    buildLaunchUrl(): string;
    doOAuthStepOne(): Promise<OAuthSession>;
    private captureAutoMergeContext;
    private performAutoMerge;
}
