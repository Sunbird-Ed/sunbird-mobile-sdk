import {ApiRequestHandler, ApiService, HttpRequestType, Request, Response} from '../../../api';
import {ContentServiceConfig, SearchResponse} from '../..';
import {Observable} from 'rxjs';
import {SearchRequest} from '../../def/search-request';
import {ProfileServiceConfig} from '../../../profile';

export class ContentSearchApiHandler implements ApiRequestHandler<SearchRequest, SearchResponse> {
    private readonly SEARCH_ENDPOINT = '/search';

    constructor(private apiService: ApiService,
                private contentServiceConfig: ContentServiceConfig) {
    }

    handle(request: SearchRequest): Observable<SearchResponse> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.contentServiceConfig.searchApiPath.concat(this.SEARCH_ENDPOINT))
            .withApiToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<SearchResponse>(apiRequest).map((success) => {
            return success.body;
        });
    }

}
