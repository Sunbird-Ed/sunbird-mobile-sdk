import { ApiRequestHandler, ApiService, HttpRequestType, Request } from '../../api';
import { UserProfileDetailsRequest } from '../def/user-profile-details-request';
import { UserProfile } from '../def/user-profile';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { Observable } from 'rxjs';

export class GetUserProfileDetailsHandler implements ApiRequestHandler<UserProfileDetailsRequest, UserProfile> {
    public readonly GET_USER_PROFILE_DETAILS_ENDPOINT = 'read';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private sessionAuthenticator: SessionAuthenticator) {
    }

    public handle(request: UserProfileDetailsRequest): Observable<UserProfile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.apiPath + this.GET_USER_PROFILE_DETAILS_ENDPOINT + request.userId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: UserProfile } >(apiRequest).map((success) => {
            return success.body.result;
        });

    }

}
