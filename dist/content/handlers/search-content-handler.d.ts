import { ContentData, ContentSearchCriteria, ContentSearchFilter, ContentSearchResult, ContentServiceConfig, ContentSortCriteria, FilterValue, SearchResponse } from '..';
import { AppConfig } from '../../api/config/app-config';
import { SearchFilter, SearchRequest } from '../def/search-request';
import { TelemetryService } from '../../telemetry';
export declare class SearchContentHandler {
    private appConfig;
    private contentServiceConfig;
    private telemetryService;
    static readonly AUDIENCE_LEARNER: string[];
    static readonly AUDIENCE_INSTRUCTOR: string[];
    private readonly SEARCH_ENDPOINT;
    constructor(appConfig: AppConfig, contentServiceConfig: ContentServiceConfig, telemetryService: TelemetryService);
    getSearchCriteria(requestMap: {
        [key: string]: any;
    }): ContentSearchCriteria;
    private getSortOrder;
    private getSearchType;
    getSearchContentRequest(criteria: ContentSearchCriteria): SearchRequest;
    getSearchFilter(criteria: ContentSearchCriteria): SearchFilter;
    getFilterRequest(criteria: ContentSearchCriteria): SearchFilter;
    addFiltersToRequest(searchFilter: SearchFilter, filter: ContentSearchFilter[]): void;
    getSearchRequest(criteria: ContentSearchCriteria): SearchFilter;
    getSortByRequest(sortCriteria: ContentSortCriteria[]): any;
    getCompatibilityLevelFilter(): any;
    createFilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[], appliedFilterMap: SearchFilter): ContentSearchCriteria;
    private getSortedFilterValuesWithAppliedFilters;
    private mapFilterValues;
    addFilterValue(facets: ContentSearchFilter[], filters: any): void;
    getFilterValuesWithAppliedFilter(facetValues: FilterValue[], appliedFilter: string[]): FilterValue[];
    mapSearchResponse(previousContentCriteria: ContentSearchCriteria, searchResponse: SearchResponse, searchRequest: SearchRequest): ContentSearchResult;
    getContentSearchFilter(contentIds: string[], status: string[], fields?: (keyof ContentData)[]): SearchRequest;
    getDownloadUrl(contentData: ContentData): Promise<string>;
    buildContentLoadingEvent(subtype: string, identifier: string): Promise<boolean>;
}
