import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest} from '..';
import {CachedItemRequest, CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';

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

        return of(serverProfileDetailsRequest.from).pipe(
            mergeMap((from: CachedItemRequestSourceFrom) => {
                if (from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(serverProfileDetailsRequest).pipe(
                        tap(async (profile) => {
                            return this.keyValueStore.setValue(
                                this.USER_PROFILE_DETAILS_KEY_PREFIX + '-' + profile.id, JSON.stringify(profile)
                            ).toPromise();
                        }),
                        catchError(() => {
                            return this.fetchFromCache(serverProfileDetailsRequest);
                        })
                    );
                }

                return this.fetchFromCache(serverProfileDetailsRequest);
            })
        );
    }


    private fetchFromServer(request: ServerProfileDetailsRequest): Observable<ServerProfile> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.profileServiceConfig.profileApiPath_V2 + this.GET_SERVER_PROFILE_DETAILS_ENDPOINT + '/' + request.userId)
            .withParameters({'fields': request.requiredFields.join(',')})
            .withApiToken(true)
            .withSessionToken(true)
            .withBody(request)
            .build();

        return this.apiService.fetch<{ result: { response: ServerProfile } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response;
            })
        );
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
