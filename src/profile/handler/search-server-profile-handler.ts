import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {ProfileServiceConfig} from '../config/profile-service-config';
import {SessionAuthenticator} from '../../auth';
import {Observable} from 'rxjs';

export class SearchServerProfileHandler implements ApiRequestHandler<ServerProfileSearchCriteria, ServerProfile[]> {
    private readonly GET_SEARCH_USER_ENDPOINT = 'search';

    constructor(private apiService: ApiService,
                private searchServiceConfig: ProfileServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    handle(request: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        const apiRequest: Request = new Request.Builder().withType(HttpRequestType.POST)
            .withPath(this.searchServiceConfig.searchProfilePath + this.GET_SEARCH_USER_ENDPOINT + request.identifiers)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .withBody({request})
            .build();
        return this.apiService.fetch<{ result: ServerProfile[] }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

}
