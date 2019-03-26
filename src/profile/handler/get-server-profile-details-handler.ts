import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest} from '..';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {CachedItemRequest, CachedItemRequestSourceFrom} from '../../key-value-store/def/cached-item-request';

export class GetServerProfileDetailsHandler implements ApiRequestHandler<{
    serverProfileDetailsRequest: ServerProfileDetailsRequest,
    cachedItemRequest: CachedItemRequest
}, ServerProfile> {

    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT = '/read';
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'userProfileDetails';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private cachedItemStore: CachedItemStore<ServerProfile>,
        private keyValueStore: KeyValueStore) {
    }

    handle({serverProfileDetailsRequest, cachedItemRequest}): Observable<ServerProfile> {
        return Observable.of(cachedItemRequest.from)
            .mergeMap((from: CachedItemRequestSourceFrom) => {
                if (from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(serverProfileDetailsRequest)
                        .do(async (profile) => {
                            return this.keyValueStore.setValue(
                                this.USER_PROFILE_DETAILS_KEY_PREFIX + '-' + profile.id, JSON.stringify(profile)
                            ).toPromise();
                        });
                }

                return this.cachedItemStore.getCached(
                    serverProfileDetailsRequest.userId,
                    this.USER_PROFILE_DETAILS_KEY_PREFIX,
                    this.USER_PROFILE_DETAILS_KEY_PREFIX,
                    () => this.fetchFromServer(serverProfileDetailsRequest)
                );
            });
    }


    private fetchFromServer(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.profileApiPath + this.GET_SERVER_PROFILE_DETAILS_ENDPOINT + '/' + request.userId)
            .withParameters({'fields': request.requiredFields.join(',')})
            .withApiToken(true)
            .withSessionToken(true)
            .withBody(request)
            .build();

        return this.apiService.fetch<{ result: { response: ServerProfile } }>(apiRequest).map((success) => {
            return success.body.result.response;
        });
    }
}
