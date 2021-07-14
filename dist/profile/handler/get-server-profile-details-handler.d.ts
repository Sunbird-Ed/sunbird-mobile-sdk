import { ApiRequestHandler } from '../../api';
import { ServerProfile, ServerProfileDetailsRequest } from '..';
import { CachedItemRequest, CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { Container } from 'inversify';
export declare class GetServerProfileDetailsHandler implements ApiRequestHandler<{
    serverProfileDetailsRequest: ServerProfileDetailsRequest;
    cachedItemRequest: CachedItemRequest;
}, ServerProfile> {
    private cachedItemStore;
    private keyValueStore;
    private container;
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX;
    constructor(cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, container: Container);
    private readonly csUserService;
    handle(serverProfileDetailsRequest: any): Observable<ServerProfile>;
    private fetchFromServer;
    private fetchFromCache;
}
