import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ProfileServiceConfig, VerifyOtpRequest} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class VerifyOtpHandler implements ApiRequestHandler<VerifyOtpRequest, boolean> {
    private readonly GET_VERIFY_OTP_ENDPOINT = '/verify';

    constructor(private apiService: ApiService,
                private optServiceConfig: ProfileServiceConfig) {
    }

    handle(request: VerifyOtpRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.optServiceConfig.otpApiPath + this.GET_VERIFY_OTP_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({
                request: request
            })
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response === 'SUCCESS';
            })
        );
    }

}
