import {
    ContentData,
    ContentImport,
    ContentSearchCriteria,
    ContentSearchFilter,
    ContentSearchResult,
    ContentServiceConfig,
    ContentSortCriteria,
    FilterValue,
    MimeType,
    SearchResponse,
    SearchType,
    SortOrder
} from '..';
import {AppConfig} from '../../api/config/app-config';
import {SearchFilter, SearchRequest} from '../def/search-request';
import {InteractType, TelemetryInteractRequest, TelemetryService} from '../../telemetry';
import {NumberUtil} from '../../util/number-util';

export class SearchContentHandler {

    constructor(private appConfig: AppConfig,
                private contentServiceConfig: ContentServiceConfig,
                private telemetryService: TelemetryService) {
    }

    getSearchCriteria(requestMap: { [key: string]: any }): ContentSearchCriteria {
        const request: { [key: string]: any } = requestMap['request'];
        const query = request['query'];
        const exists = request['exists'];
        const limit = request['limit'];
        const offset = request['offset'];
        let mode;
        if (request.hasOwnProperty('mode') && request['mode'] === 'soft') {
            mode = 'soft';
        }
        const sortCriteria: ContentSortCriteria[] = [];
        if (request.hasOwnProperty('sort_by')) {
            const sortBy = request['sort_by'];
            Object.keys(sortBy).forEach((key) => {

                const criteria: ContentSortCriteria = {
                    sortAttribute: key,
                    sortOrder: this.getSortOrder(String(sortBy[key]))
                };
                sortCriteria.push(criteria);
            });
        }

        const contentSearchCriteria: ContentSearchCriteria = {
            ...((query ? {query: query} : {})),
            ...((exists ? {exists: exists} : {})),
            mode: mode,
            sortCriteria: sortCriteria,
            searchType: this.getSearchType(String(request['searchType'])),
            offset: offset ? offset : 0,
            limit: limit ? limit : 100
        };

        let contentTypes;
        let impliedFilter;
        if (request.hasOwnProperty('filters')) {
            const filterMap: SearchFilter = request['filters'] as SearchFilter;
            if (filterMap.contentType) {
                contentTypes = filterMap.contentType;
            }
            impliedFilter = this.mapFilterValues(filterMap, contentSearchCriteria);
            contentSearchCriteria.impliedFilters = impliedFilter;
            contentSearchCriteria.contentTypes = contentTypes;
        }
        let facets: string[];
        if (request.hasOwnProperty('facets')) {
            facets = request['facets'];
            contentSearchCriteria.facets = facets;
        }

        return contentSearchCriteria;
    }

    getSearchContentRequest(criteria: ContentSearchCriteria): SearchRequest {
        return {
            query: criteria.query,
            offset: criteria.offset,
            limit: criteria.limit,
            mode: criteria.mode,
            exists: (criteria.exists && criteria.exists.length > 0) ? criteria.exists : [],
            facets: (criteria.facets && criteria.facets.length > 0) ? criteria.facets : [],
            sort_by: this.getSortByRequest(criteria.sortCriteria!),
            filters: this.getSearchFilter(criteria),
            fields: criteria.fields
        };
    }

    getSearchFilter(criteria: ContentSearchCriteria): SearchFilter {
        if (criteria.searchType!.valueOf() === SearchType.SEARCH.valueOf()) {
            return this.getSearchRequest(criteria);
        } else if (criteria.searchType!.valueOf() === SearchType.FILTER.valueOf()) {
            return this.getFilterRequest(criteria);
        }
        return {};
    }

    getFilterRequest(criteria: ContentSearchCriteria): SearchFilter {
        let searchFilter: SearchFilter = {
            compatibilityLevel: this.getCompatibilityLevelFilter(),
            contentType: (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : []
        };
        this.addFiltersToRequest(searchFilter, criteria.facetFilters!);
        this.addFiltersToRequest(searchFilter, criteria.impliedFilters!);

        if (criteria.impliedFiltersMap && criteria.impliedFiltersMap.length > 0) {
            criteria.impliedFiltersMap.forEach(filterMap => {
                searchFilter = {
                    ...searchFilter,
                    ...filterMap
                };
            });
        }
        return searchFilter;
    }

    addFiltersToRequest(searchFilter: SearchFilter, filter: ContentSearchFilter[]) {
        if (filter && filter.length) {
            filter.forEach(facetFilter => {
                const filterValueList: string[] = [];
                facetFilter.values.forEach(value => {
                    if (value.apply) {
                        filterValueList.push(value.name);
                    }
                });

                if (filterValueList.length) {
                    searchFilter[facetFilter.name] = filterValueList;
                }

            });
        }
    }

    getSearchRequest(criteria: ContentSearchCriteria): SearchFilter {
        return {
            compatibilityLevel: this.getCompatibilityLevelFilter(),
            status: criteria.contentStatusArray,
            objectType: ['Content'],
            contentType: (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : [],
            ...((criteria.keywords && criteria.keywords.length) ? {keywords: criteria.keywords} : {}),
            ...((criteria.dialCodes && criteria.dialCodes.length) ? {dialcodes: criteria.dialCodes} : {}),
            ...((criteria.createdBy && criteria.createdBy.length) ? {createdBy: criteria.createdBy} : {}),
            ...((criteria.grade && criteria.grade.length) ? {gradeLevel: criteria.grade} : {}),
            medium: (criteria.medium && criteria.medium.length > 0) ? criteria.medium : [],
            board: (criteria.board && criteria.board.length > 0) ? criteria.board : [],
            language: (criteria.language && criteria.language.length > 0) ? criteria.language : [],
            topic: (criteria.topic && criteria.topic.length > 0) ? criteria.topic : [],
            purpose: (criteria.purpose && criteria.purpose.length > 0) ? criteria.purpose : [],
            channel: (criteria.channel && criteria.channel.length > 0) ? criteria.channel : [],
            mimeType: (criteria.mimeType && criteria.mimeType.length > 0) ? criteria.mimeType : [],
            subject: (criteria.subject && criteria.subject.length > 0) ? criteria.subject : []

            // TODO Revisit on inclusion and exclusion filters
        };
    }

    getSortByRequest(sortCriteria?: ContentSortCriteria[]): {[key: string]: SortOrder} {
        if (!sortCriteria) {
            return {};
        }

        return sortCriteria.reduce((acc, criteria) => {
            acc[criteria.sortAttribute] = criteria.sortOrder;
            return acc;
        }, {});
    }

    getCompatibilityLevelFilter(): any {
        return {'min': 1, 'max': this.appConfig.maxCompatibilityLevel};
    }

    createFilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[],
                         appliedFilterMap: SearchFilter): ContentSearchCriteria {
        const facetFilters: ContentSearchFilter[] = [];
        const contentSearchCriteria: ContentSearchCriteria = {
            query: previouscriteria.query,
            limit: previouscriteria.limit,
            offset: previouscriteria.offset,
            facets: previouscriteria.facets,
            contentTypes: previouscriteria.contentTypes,
            sortCriteria: previouscriteria.sortCriteria && previouscriteria.sortCriteria.length
                ? previouscriteria.sortCriteria : [],
            mode: previouscriteria.mode === 'soft' ? 'soft' : 'hard',
        };

        if (!facets) {
            return contentSearchCriteria;
        }

        facets.forEach((facet) => {
            const appliedFilter: string[] = appliedFilterMap ? appliedFilterMap[facet.name] : [];
            const facetValues: FilterValue[] = facet.values;
            const values = this.getSortedFilterValuesWithAppliedFilters(facetValues, appliedFilter);
            if (facet.name) {
                const filter: ContentSearchFilter = {
                    name: facet.name,
                    values: values
                };

                facetFilters.push(filter);
            }
            delete appliedFilterMap[facet.name];
        });
        contentSearchCriteria.facetFilters = facetFilters;
        contentSearchCriteria.impliedFilters = this.mapFilterValues(appliedFilterMap, contentSearchCriteria);
        return contentSearchCriteria;
    }

    addFilterValue(facets: ContentSearchFilter[], filters) {
        if (facets && facets.length > 0) {
            facets.forEach(facet => {
                const facetName: string = facet.name;
                const values: FilterValue[] = facet.values;
                const appliedFilter: string[] = filters[facetName];
            });
        }
    }

    getFilterValuesWithAppliedFilter(facetValues: FilterValue[], appliedFilter: string[]): FilterValue[] {
        facetValues.forEach(facetValue => {
            let isApplied = false;
            if (appliedFilter && appliedFilter.indexOf(name) > -1) {
                isApplied = true;
            }
            facetValue.apply = isApplied;
        });
        return facetValues;
    }

    mapSearchResponse(previousContentCriteria: ContentSearchCriteria, searchResponse: SearchResponse,
                      searchRequest: SearchRequest): ContentSearchResult {
        const constentSearchResult: ContentSearchResult = {
            id: searchResponse.id,
            responseMessageId: searchResponse.params.resmsgid,
            filterCriteria: this.createFilterCriteria(previousContentCriteria, searchResponse.result.facets, searchRequest.filters),
            request: searchRequest,
            contentDataList: searchResponse.result.content,
            collectionDataList: searchResponse.result.collections ? searchResponse.result.collections : []
        };
        return constentSearchResult;
    }

    public getContentSearchFilter(contentIds: string[], status: string[], fields: (keyof ContentData)[] = []): SearchRequest {
        return {
            filters: {
                compatibilityLevel: this.getCompatibilityLevelFilter(),
                identifier: contentIds.filter((v, i) => contentIds.indexOf(v) === i),
                status: status,
                objectType: ['Content']
            },
            fields: [
                ...fields,
                'downloadUrl', 'variants', 'mimeType', 'contentType', 'pkgVersion'
            ]
        };
    }

    public async getDownloadUrl(contentData: ContentData, contentImport?: ContentImport): Promise<string> {
        let downloadUrl;
        if (contentData.mimeType === MimeType.COLLECTION.valueOf()) {
            const variants = contentData.variants;
            if (variants && variants['online']) {
                const spineData = variants['online'];
                downloadUrl = spineData && spineData['ecarUrl'];
                await this.buildContentLoadingEvent('online', contentImport!, contentData.contentType, contentData.pkgVersion);
            } else if (variants && variants['spine']) {
                const spineData = variants['spine'];
                downloadUrl = spineData && spineData['ecarUrl'];
                await this.buildContentLoadingEvent('spine', contentImport!, contentData.contentType, contentData.pkgVersion);
            }
        }

        if (!downloadUrl) {
            downloadUrl = contentData.downloadUrl!.trim();
            await this.buildContentLoadingEvent('full', contentImport!, contentData.contentType, contentData.pkgVersion);
        }
        return downloadUrl;
    }

    buildContentLoadingEvent(subtype: string, contentImport: ContentImport, contentType: string, contentVersion: string): Promise<boolean> {
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = InteractType.OTHER;
        telemetryInteractRequest.subType = subtype;
        telemetryInteractRequest.pageId = 'ImportContent';
        telemetryInteractRequest.id = 'ImportContent';
        telemetryInteractRequest.objId = contentImport.contentId;
        telemetryInteractRequest.objType = contentType;
        telemetryInteractRequest.objVer = contentVersion;
        telemetryInteractRequest.rollup = contentImport.rollUp;
        telemetryInteractRequest.correlationData = contentImport.correlationData;
        return this.telemetryService.interact(telemetryInteractRequest).toPromise();
    }

    private getSortOrder(order): SortOrder {
        let sortOrder: SortOrder;
        if (order === 'asc') {
            sortOrder = SortOrder.ASC;
        } else if (order === 'desc') {
            sortOrder = SortOrder.DESC;
        } else {
            sortOrder = SortOrder.DESC;
        }
        return sortOrder;
    }

    private getSearchType(type): SearchType {
        let searchType: SearchType;
        if (type === 'search') {
            searchType = SearchType.SEARCH;
        } else if (type === 'filter') {
            searchType = SearchType.FILTER;
        } else {
            searchType = SearchType.SEARCH;
        }
        return searchType;
    }

    private getSortedFilterValuesWithAppliedFilters(facetValues: FilterValue[], appliedFilters: string[]): FilterValue[] {
        facetValues.forEach((facetValue) => {
            let applied = false;
            if (appliedFilters) {
                appliedFilters.forEach((appliedFilter) => {
                    if (appliedFilter && facetValue.name && facetValue.name === appliedFilter.toLowerCase()) {
                        applied = true;
                    }
                });
            }
            facetValue.apply = applied;
            facetValue.count = NumberUtil.parseInt(facetValue.count);
        });
        return facetValues;
    }

    private mapFilterValues(filtersMap: SearchFilter, contentSearchCriteria: ContentSearchCriteria): ContentSearchFilter[] {
        const contentSearchFilters: ContentSearchFilter[] = [];
        const impliedFiltersMap: { [key: string]: any }[] = [];
        Object.keys(filtersMap).forEach(key => {
            const values = filtersMap[key];
            if (Array.isArray(values) && values.length) {
                const filterValues: FilterValue[] = [];
                values.forEach((value) => {
                    const filterValue: FilterValue = {name: value, apply: true};
                    filterValues.push(filterValue);
                });
                contentSearchFilters.push({name: key, values: filterValues});
            } else if (values) {
                const filterMap: { [key: string]: any } = {};
                filterMap[key] = values;
                impliedFiltersMap.push(filterMap);
            }
        });
        contentSearchCriteria.impliedFiltersMap = impliedFiltersMap;
        return contentSearchFilters;
    }

}
