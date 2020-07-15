import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../../api';
import {ContentServiceConfig, SearchResponse} from '../..';
import {Observable} from 'rxjs';
import {SearchRequest} from '../../def/search-request';
import {map} from 'rxjs/operators';

export class ContentSearchApiHandler implements ApiRequestHandler<SearchRequest, SearchResponse> {
    private readonly SEARCH_ENDPOINT = '/search';

    constructor(private apiService: ApiService,
                private contentServiceConfig: ContentServiceConfig,
                private framework?: string,
                private langCode?: string) {
    }

    handle(request: SearchRequest): Observable<SearchResponse> {
        const additionalPath = this.framework && this.langCode && `?framework=${this.framework}&lang=${this.langCode}&orgdetails=orgName`;
        const apiRequest: Request = new Request.Builder()
            .withHost(this.contentServiceConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.contentServiceConfig.searchApiPath.concat(this.SEARCH_ENDPOINT).concat(additionalPath ? additionalPath : ''))
            .withBearerToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<SearchResponse>(apiRequest).pipe(
            map((success) => {
                return success.body;
            })
        );
    }

}
