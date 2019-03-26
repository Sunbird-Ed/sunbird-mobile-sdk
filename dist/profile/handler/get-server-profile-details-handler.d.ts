import { ApiRequestHandler, ApiService } from '../../api';
import { ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest } from '..';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { CachedItemRequest } from '../../key-value-store/def/cached-item-request';
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
    constructor(apiService: ApiService, profileServiceConfig: ProfileServiceConfig, cachedItemStore: CachedItemStore<ServerProfile>, keyValueStore: KeyValueStore);
    handle({ serverProfileDetailsRequest, cachedItemRequest }: {
        serverProfileDetailsRequest: any;
        cachedItemRequest: any;
    }): Observable<ServerProfile>;
    private fetchFromServer;
    private fetchFromCache;
}
