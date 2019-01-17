import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ServerProfileDetailsRequest} from '../def/server-profile-details-request';
import {ServerProfileDetails} from '../def/server-profile-details';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';

export class GetServerProfileDetailsHandler implements ApiRequestHandler<ServerProfileDetailsRequest, ServerProfileDetails> {
    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT = 'read';
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'serverProfileDetails';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private sessionAuthenticator: SessionAuthenticator,
        private cachedItemStore: CachedItemStore<ServerProfileDetails>) {
    }

    handle(request: ServerProfileDetailsRequest): Observable<ServerProfileDetails> {
        return this.cachedItemStore.getCached(
            request.userId,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            () => this.fetchFormServer(request)
        );

    }


    private fetchFormServer(request: ServerProfileDetailsRequest): Observable<ServerProfileDetails> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.apiPath + this.GET_SERVER_PROFILE_DETAILS_ENDPOINT + request.userId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: ServerProfileDetails }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
