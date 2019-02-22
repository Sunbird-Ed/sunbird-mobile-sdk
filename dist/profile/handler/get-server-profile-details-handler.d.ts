import { ApiRequestHandler, ApiService } from '../../api';
import { ProfileServiceConfig, ServerProfile, ServerProfileDetailsRequest } from '..';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
export declare class GetServerProfileDetailsHandler implements ApiRequestHandler<ServerProfileDetailsRequest, ServerProfile> {
    private apiService;
    private profileServiceConfig;
    private cachedItemStore;
    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT;
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX;
    constructor(apiService: ApiService, profileServiceConfig: ProfileServiceConfig, cachedItemStore: CachedItemStore<ServerProfile>);
    handle(request: ServerProfileDetailsRequest): Observable<ServerProfile>;
    private fetchFormServer;
}
