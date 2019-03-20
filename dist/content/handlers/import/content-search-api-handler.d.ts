import { ApiRequestHandler, ApiService } from '../../../api';
import { ContentServiceConfig, SearchResponse } from '../..';
import { Observable } from 'rxjs';
import { SearchRequest } from '../../def/search-request';
export declare class ContentSearchApiHandler implements ApiRequestHandler<SearchRequest, SearchResponse> {
    private apiService;
    private contentServiceConfig;
    private framework?;
    private langCode?;
    private readonly SEARCH_ENDPOINT;
    constructor(apiService: ApiService, contentServiceConfig: ContentServiceConfig, framework?: string | undefined, langCode?: string | undefined);
    handle(request: SearchRequest): Observable<SearchResponse>;
}
