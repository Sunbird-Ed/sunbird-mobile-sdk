import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {ServerProfileSearchCriteria} from '../def/server-profile-search-criteria';
import {ServerProfile} from '../def/server-profile';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';

export class SearchServerProfileHandler implements ApiRequestHandler<ServerProfileSearchCriteria, ServerProfile[]> {
    private readonly GET_SEARCH_USER_ENDPOINT = '/api/user/v1/search';

    constructor(private apiService: ApiService,
                private searchServiceConfig: ProfileServiceConfig) {
    }

    handle(request: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.searchServiceConfig.searchProfilePath + this.GET_SEARCH_USER_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({
                request: {
                    query: request.query,
                    filters: {
                        identifier: request.identifiers ? request.identifiers : []
                    },
                    fields: request.fields,
                    offset: request.offset,
                    limit: request.limit
                }
            })
            .build();

        return this.apiService.fetch<{ result: ServerProfile[] }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

}
