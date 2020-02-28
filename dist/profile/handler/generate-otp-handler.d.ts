import { ApiRequestHandler, ApiService } from '../../api';
import { GenerateOtpRequest, ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class GenerateOtpHandler implements ApiRequestHandler<GenerateOtpRequest, boolean> {
    private apiService;
    private otpServiceConfig;
    private readonly GET_GENERATE_OTP_ENDPOINT;
    constructor(apiService: ApiService, otpServiceConfig: ProfileServiceConfig);
    handle(request: GenerateOtpRequest): Observable<boolean>;
}
