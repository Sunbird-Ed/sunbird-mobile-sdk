import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {ProfileServiceConfig, ServerProfileSearchCriteria} from '../index';
import {ServerProfile} from '../def/server-profile';
import {Observable} from 'rxjs';

export class SearchServerProfileHandler implements ApiRequestHandler<ServerProfileSearchCriteria, ServerProfile[]> {
    private readonly GET_SEARCH_USER_ENDPOINT = '/search';

    constructor(private apiService: HttpService,
                private searchServiceConfig: ProfileServiceConfig) {
    }

    handle(request: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.searchServiceConfig.profileApiPath + this.GET_SEARCH_USER_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({
                request: {
                    ...request,
                    filters: {
                        identifier: request.filters.identifier ? Array.from(request.filters.identifier) : []
                    }
                }
            })
            .build();

        return this.apiService.fetch<{ result: { response: { content: ServerProfile[] } } }>(apiRequest).map((success) => {
            return success.body.result.response.content;
        });
    }

}
