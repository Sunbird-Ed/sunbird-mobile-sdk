import { ContentData, ContentImport, ContentSearchCriteria, ContentSearchFilter, ContentSearchResult, ContentServiceConfig, ContentSortCriteria, FilterValue, SearchResponse, SortOrder } from '..';
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
    private getSearchFilter;
    private getFilterRequest;
    private addFiltersToRequest;
    private getSearchRequest;
    private getImpliedFilterValues;
    getSortByRequest(sortCriteria?: ContentSortCriteria[]): {
        [key: string]: SortOrder;
    };
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
