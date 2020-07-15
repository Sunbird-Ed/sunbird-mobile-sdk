import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {GenerateOtpRequest, ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class GenerateOtpHandler implements ApiRequestHandler<GenerateOtpRequest, boolean> {
    private readonly GET_GENERATE_OTP_ENDPOINT = '/generate';

    constructor(private apiService: ApiService,
                private otpServiceConfig: ProfileServiceConfig) {
    }

    handle(request: GenerateOtpRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.otpServiceConfig.otpApiPath + this.GET_GENERATE_OTP_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({request: request})
            .build();

        return this.apiService.fetch <{ result: { response: string } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response === 'SUCCESS';
            })
        );
    }

}
