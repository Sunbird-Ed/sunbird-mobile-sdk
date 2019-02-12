import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ServerProfileDetailsRequest} from '..';
import {ProfileServiceConfig} from '..';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {ServerProfile} from '../def/server-profile';

export class GetServerProfileDetailsHandler implements ApiRequestHandler<ServerProfileDetailsRequest, ServerProfile> {
    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT = '/read';
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'userProfileDetails';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private cachedItemStore: CachedItemStore<ServerProfile>) {
    }

    handle(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return this.cachedItemStore.getCached(
            request.userId,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            () => this.fetchFormServer(request)
        );

    }


    private fetchFormServer(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.profileApiPath + this.GET_SERVER_PROFILE_DETAILS_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody(request)
            .build();

        return this.apiService.fetch<{ result: ServerProfile }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
