import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest} from '..';
import {CachedItemRequest, CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Observable} from 'rxjs';

export class GetServerProfileDetailsHandler implements ApiRequestHandler<{
    serverProfileDetailsRequest: ServerProfileDetailsRequest,
    cachedItemRequest: CachedItemRequest
}, ServerProfile> {

    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT = '/read';
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'userProfileDetails';

    constructor(
        private apiService: ApiService,
        private profileServiceConfig: ProfileServiceConfig,
        private cachedItemStore: CachedItemStore,
        private keyValueStore: KeyValueStore) {
    }

    handle(serverProfileDetailsRequest): Observable<ServerProfile> {

        serverProfileDetailsRequest.from = serverProfileDetailsRequest.from || CachedItemRequestSourceFrom.CACHE;

        return Observable.of(serverProfileDetailsRequest.from)
            .mergeMap((from: CachedItemRequestSourceFrom) => {
                if (from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(serverProfileDetailsRequest)
                        .do(async (profile) => {
                            return this.keyValueStore.setValue(
                                this.USER_PROFILE_DETAILS_KEY_PREFIX + '-' + profile.id, JSON.stringify(profile)
                            ).toPromise();
                        })
                        .catch(() => {
                            return this.fetchFromCache(serverProfileDetailsRequest);
                        });
                }

                return this.fetchFromCache(serverProfileDetailsRequest);
            });
    }


    private fetchFromServer(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath('/api/user/v2' + this.GET_SERVER_PROFILE_DETAILS_ENDPOINT + '/' + request.userId)
            .withParameters({'fields': request.requiredFields.join(',')})
            .withApiToken(true)
            .withSessionToken(true)
            .withBody(request)
            .build();

        return this.apiService.fetch<{ result: { response: ServerProfile } }>(apiRequest).map((success) => {
            return success.body.result.response;
        });
    }

    private fetchFromCache(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return this.cachedItemStore.getCached(
            request.userId,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            this.USER_PROFILE_DETAILS_KEY_PREFIX,
            () => this.fetchFromServer(request)
        );
    }
}
