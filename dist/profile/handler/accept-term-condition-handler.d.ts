import { ApiRequestHandler, ApiService } from '../../api';
import { AcceptTermsConditionRequest, ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class AcceptTermConditionHandler implements ApiRequestHandler<AcceptTermsConditionRequest, boolean> {
    private apiService;
    private acceptTermsConditionApiConfig;
    private readonly GET_ACCEPT_TERM_CONDITIONS_ENDPOINT;
    constructor(apiService: ApiService, acceptTermsConditionApiConfig: ProfileServiceConfig);
    handle(request: AcceptTermsConditionRequest): Observable<boolean>;
}
