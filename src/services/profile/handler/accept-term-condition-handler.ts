import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {AcceptTermsConditionRequest, ProfileServiceConfig} from '../index';
import {Observable} from 'rxjs';

export class AcceptTermConditionHandler implements ApiRequestHandler<AcceptTermsConditionRequest, boolean> {
    private readonly GET_ACCEPT_TERM_CONDITIONS_ENDPOINT = '/tnc/accept';

    constructor(private apiService: HttpService,
                private acceptTermsConditionApiConfig: ProfileServiceConfig) {
    }

    handle(request: AcceptTermsConditionRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.acceptTermsConditionApiConfig.profileApiPath + this.GET_ACCEPT_TERM_CONDITIONS_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).map((success) => {
            return success.body.result.response === 'SUCCESS';
        });
    }
}

