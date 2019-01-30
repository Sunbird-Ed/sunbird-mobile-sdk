import { ApiRequestHandler, ApiService } from '../../api';
import { ServerProfileDetailsRequest } from '../def/server-profile-details-request';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { ServerProfile } from '../def/server-profile';
export declare class GetServerProfileDetailsHandler implements ApiRequestHandler<ServerProfileDetailsRequest, ServerProfile> {
    private apiService;
    private profileServiceConfig;
    private sessionAuthenticator;
    private cachedItemStore;
    private readonly GET_SERVER_PROFILE_DETAILS_ENDPOINT;
    private readonly USER_PROFILE_DETAILS_KEY_PREFIX;
    constructor(apiService: ApiService, profileServiceConfig: ProfileServiceConfig, sessionAuthenticator: SessionAuthenticator, cachedItemStore: CachedItemStore<ServerProfile>);
    handle(request: ServerProfileDetailsRequest): Observable<ServerProfile>;
    private fetchFormServer;
}
