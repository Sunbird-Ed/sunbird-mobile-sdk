import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {ProfileServiceConfig, VerifyOtpRequest} from '../index';
import {Observable} from 'rxjs';

export class VerifyOtpHandler implements ApiRequestHandler<VerifyOtpRequest, boolean> {
    private readonly GET_VERIFY_OTP_ENDPOINT = '/verify';

    constructor(private apiService: HttpService,
                private optServiceConfig: ProfileServiceConfig) {
    }

    handle(request: VerifyOtpRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.optServiceConfig.otpApiPath + this.GET_VERIFY_OTP_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({
                request: {
                    key: request.key,
                    type: request.type,
                    otp: request.otp
                }
            })
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).map((success) => {
            return success.body.result.response === 'SUCCESS';
        });
    }

}
