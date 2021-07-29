import { ApiRequestHandler, ApiService } from '../../api';
import { VerifyOtpRequest } from '..';
import { ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class VerifyOtpHandler implements ApiRequestHandler<VerifyOtpRequest, boolean> {
    private apiService;
    private optServiceConfig;
    private readonly GET_VERIFY_OTP_ENDPOINT;
    constructor(apiService: ApiService, optServiceConfig: ProfileServiceConfig);
    handle(request: VerifyOtpRequest): Observable<boolean>;
}
