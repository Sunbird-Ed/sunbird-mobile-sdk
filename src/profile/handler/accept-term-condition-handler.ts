import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {AcceptTermsConditionRequest, ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class AcceptTermConditionHandler implements ApiRequestHandler<AcceptTermsConditionRequest, boolean> {
    private readonly GET_ACCEPT_TERM_CONDITIONS_ENDPOINT = '/tnc/accept';

    constructor(private apiService: ApiService,
                private acceptTermsConditionApiConfig: ProfileServiceConfig) {
    }

    handle(request: AcceptTermsConditionRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.acceptTermsConditionApiConfig.profileApiPath + this.GET_ACCEPT_TERM_CONDITIONS_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response === 'SUCCESS';
            })
        );
    }
}

