import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {GenerateOtpRequest} from '..';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';

export class GenerateOtpHandler implements ApiRequestHandler<GenerateOtpRequest, boolean> {
    private readonly GET_GENERATE_OTP_ENDPOINT = '/generate';

    constructor(private apiService: ApiService,
                private otpServiceConfig: ProfileServiceConfig) {
    }

    handle(request: GenerateOtpRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.otpServiceConfig.otpApiPath + this.GET_GENERATE_OTP_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({
                request: {
                    key: request.key,
                    type: request.type
                }
            })
            .build();

        return this.apiService.fetch <{ result: { response: string } }>(apiRequest).map((success) => {
            return success.body.result.response === 'SUCCESS';
        });
    }

}
