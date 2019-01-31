import { ApiRequestHandler, ApiService } from '../../api';
import { ServerProfileSearchCriteria } from '../def/server-profile-search-criteria';
import { ServerProfile } from '../def/server-profile';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { Observable } from 'rxjs';
export declare class SearchServerProfileHandler implements ApiRequestHandler<ServerProfileSearchCriteria, ServerProfile[]> {
    private apiService;
    private searchServiceConfig;
    private sessionAuthenticator;
    private readonly GET_SEARCH_USER_ENDPOINT;
    constructor(apiService: ApiService, searchServiceConfig: ProfileServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: ServerProfileSearchCriteria): Observable<ServerProfile[]>;
}
