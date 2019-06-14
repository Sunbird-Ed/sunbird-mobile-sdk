import { ApiRequestHandler, ApiService } from '../../api';
import { ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest } from '..';
import { CachedItemRequest, CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
export declare class GetServerProfileDetailsHandler implements ApiRequestHandler<{
    serverProfileDetailsRequest: ServerProfileDetailsRequest;
    cachedItemRequest: CachedItemRequest;
}, ServerProfile> {
    private apiService;
    private profileServiceConfig;
    private cachedItemStore;
    private keyValueStore;
    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT;
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX;
    constructor(apiService: ApiService, profileServiceConfig: ProfileServiceConfig, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore);
    handle(serverProfileDetailsRequest: any): Observable<ServerProfile>;
    private fetchFromServer;
    private fetchFromCache;
}
