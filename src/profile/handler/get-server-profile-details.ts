import { ApiRequestHandler, ApiService, HttpRequestType, Request } from '../../api';
import { ServerProfileDetailsRequest } from '../def/server-profile-details-request';
import { ServerProfileDetails } from '../def/server-profile-details';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { Observable } from 'rxjs';

export class GetServerProfileDetails implements ApiRequestHandler<ServerProfileDetailsRequest, ServerProfileDetails> {
    public readonly GET_USER_PROFILE_DETAILS_ENDPOINT = 'read';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private sessionAuthenticator: SessionAuthenticator) {
    }

    public handle(request: ServerProfileDetailsRequest): Observable<ServerProfileDetails> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.apiPath + this.GET_USER_PROFILE_DETAILS_ENDPOINT + request.userId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: ServerProfileDetails } >(apiRequest).map((success) => {
            return success.body.result;
        });

    }

}
