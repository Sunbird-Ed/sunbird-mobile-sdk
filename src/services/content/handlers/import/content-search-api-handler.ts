import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../../native/http';
import {ContentServiceConfig, SearchResponse} from '../../index';
import {Observable} from 'rxjs';
import {SearchRequest} from '../../def/search-request';

export class ContentSearchApiHandler implements ApiRequestHandler<SearchRequest, SearchResponse> {
    private readonly SEARCH_ENDPOINT = '/search';

    constructor(private apiService: HttpService,
                private contentServiceConfig: ContentServiceConfig,
                private framework?: string,
                private langCode?: string) {
    }

    handle(request: SearchRequest): Observable<SearchResponse> {
        const additionalPath = this.framework && this.langCode && `?framework=${this.framework}&lang=${this.langCode}`;
        const apiRequest: Request = new Request.Builder()
            .withHost(this.contentServiceConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.contentServiceConfig.searchApiPath.concat(this.SEARCH_ENDPOINT).concat(additionalPath ? additionalPath : ''))
            .withApiToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<SearchResponse>(apiRequest).map((success) => {
            return success.body;
        });
    }

}
