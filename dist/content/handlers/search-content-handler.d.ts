import { ContentSearchCriteria, ContentSearchFilter, ContentSortCriteria, FilterValue } from '../def/requests';
import { ContentServiceConfig } from '../config/content-config';
import { SessionAuthenticator } from '../../auth';
import { Request } from '../../api';
import { AppConfig } from '../../api/config/app-config';
import { ContentSearchResult } from '../def/response';
export declare class SearchContentHandler {
    private appConfig;
    private contentServiceConfig;
    private sessionAuthenticator;
    static readonly AUDIENCE_LEARNER: string[];
    static readonly AUDIENCE_INSTRUCTOR: string[];
    private readonly SEARCH_ENDPOINT;
    constructor(appConfig: AppConfig, contentServiceConfig: ContentServiceConfig, sessionAuthenticator: SessionAuthenticator);
    getSearchContentRequest(criteria: ContentSearchCriteria): any;
    getSearchFilter(criteria: ContentSearchCriteria): any;
    getFilterRequest(criteria: ContentSearchCriteria): any;
    addFiltersToRequest(searchRequest: any, filter: ContentSearchFilter[]): void;
    getSearchRequest(criteria: ContentSearchCriteria): any;
    getSortByRequest(sortCriteria: ContentSortCriteria[]): any;
    getCompatibilityLevelFilter(): any;
    getRequest(request: any, framework: string, langCode: string): Request;
    createFiilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[], filters: any): {
        'query': string;
        'limit': number;
        'offset': number;
        'facets': string[];
        'sort': ContentSortCriteria[];
        'mode': string;
        'facetFilters': never[];
    };
    addFilterValue(facets: ContentSearchFilter[], filters: any): void;
    getFilterValuesWithAppliedFilter(facetValues: FilterValue[], appliedFilter: string[]): FilterValue[];
    mapSearchResponse(searchResponse: any): ContentSearchResult;
}
