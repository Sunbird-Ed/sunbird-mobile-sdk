import { ContentData, ContentImport, ContentSearchCriteria, ContentSearchFilter, ContentSearchResult, ContentServiceConfig, ContentSortCriteria, FilterValue, SearchResponse } from '..';
import { AppConfig } from '../../api/config/app-config';
import { SearchFilter, SearchRequest } from '../def/search-request';
import { TelemetryService } from '../../telemetry';
export declare class SearchContentHandler {
    private appConfig;
    private contentServiceConfig;
    private telemetryService;
    constructor(appConfig: AppConfig, contentServiceConfig: ContentServiceConfig, telemetryService: TelemetryService);
    getSearchCriteria(requestMap: {
        [key: string]: any;
    }): ContentSearchCriteria;
    getSearchContentRequest(criteria: ContentSearchCriteria): SearchRequest;
    getSearchFilter(criteria: ContentSearchCriteria): SearchFilter;
    getFilterRequest(criteria: ContentSearchCriteria): SearchFilter;
    addFiltersToRequest(searchFilter: SearchFilter, filter: ContentSearchFilter[]): void;
    getSearchRequest(criteria: ContentSearchCriteria): SearchFilter;
    getSortByRequest(sortCriteria: ContentSortCriteria[]): any;
    getCompatibilityLevelFilter(): any;
    createFilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[], appliedFilterMap: SearchFilter): ContentSearchCriteria;
    addFilterValue(facets: ContentSearchFilter[], filters: any): void;
    getFilterValuesWithAppliedFilter(facetValues: FilterValue[], appliedFilter: string[]): FilterValue[];
    mapSearchResponse(previousContentCriteria: ContentSearchCriteria, searchResponse: SearchResponse, searchRequest: SearchRequest): ContentSearchResult;
    getContentSearchFilter(contentIds: string[], status: string[], fields?: (keyof ContentData)[]): SearchRequest;
    getDownloadUrl(contentData: ContentData, contentImport?: ContentImport): Promise<string>;
    buildContentLoadingEvent(subtype: string, contentImport: ContentImport, contentType: string, contentVersion: string): Promise<boolean>;
    private getSortOrder;
    private getSearchType;
    private getSortedFilterValuesWithAppliedFilters;
    private mapFilterValues;
}
