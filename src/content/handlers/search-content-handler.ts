import {
    ContentSearchCriteria,
    ContentSearchFilter,
    ContentSearchResult,
    ContentServiceConfig,
    ContentSortCriteria,
    FilterValue,
    SortOrder
} from '..';
import {HttpRequestType, Request} from '../../api';
import {AppConfig} from '../../api/config/app-config';
import {SearchType} from '../util/content-constants';

export class SearchContentHandler {

    public static readonly AUDIENCE_LEARNER = ['learner'];
    public static readonly AUDIENCE_INSTRUCTOR = ['instructor'];
    private readonly SEARCH_ENDPOINT = '/api/search';

    constructor(private appConfig: AppConfig,
                private contentServiceConfig: ContentServiceConfig) {
    }

    getSearchContentRequest(criteria: ContentSearchCriteria): any {
        return {
            query: criteria.query,
            offset: criteria.offset,
            limit: criteria.limit,
            mode: criteria.mode,
            exists: (criteria.exists && criteria.exists.length > 0) ? criteria.exists : [],
            facets: (criteria.facets && criteria.facets.length > 0) ? criteria.facets : [],
            sort_by: this.getSortByRequest(criteria.sortCriteria),
            filters: this.getSearchFilter(criteria)
        };
    }

    getSearchFilter(criteria: ContentSearchCriteria): any {
        if (criteria.searchType.valueOf() === SearchType.SEARCH) {
            return this.getSearchRequest(criteria);
        } else if (criteria.searchType.valueOf() === SearchType.FILTER) {
            return this.getFilterRequest(criteria);
        }
    }

    getFilterRequest(criteria: ContentSearchCriteria): any {
        let searchRequest = {
            'compatibilityLevel': this.getCompatibilityLevelFilter(),
            'contentType': (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : [],
        };
        this.addFiltersToRequest(searchRequest, criteria.facetFilters);
        this.addFiltersToRequest(searchRequest, criteria.impliedFilters);

        if (criteria.impliedFiltersMap && criteria.impliedFiltersMap.length > 0) {
            criteria.impliedFiltersMap.forEach(filterMap => {
                searchRequest = {
                    ...searchRequest,
                    ...filterMap
                };
            });
        }

    }

    addFiltersToRequest(searchRequest, filter: ContentSearchFilter[]) {

        if (filter.length > 0) {
            filter.forEach(facetFilter => {
                const filterValueList: string[] = [];
                facetFilter.values.forEach(value => {
                    filterValueList.push(value.name);
                });

                if (filterValueList.length > 0) {
                    searchRequest[facetFilter.name] = filterValueList;
                }

            });
        }
    }


    getSearchRequest(criteria: ContentSearchCriteria): any {
        return {
            compatibilityLevel: this.getCompatibilityLevelFilter(),
            status: criteria.contentStatusArray,
            objectType: ['Content'],
            contentType: (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : [],
            keywords: (criteria.keywords && criteria.keywords.length > 0) ? criteria.keywords : [],
            dialcodes: (criteria.dialCodes && criteria.dialCodes.length > 0) ? criteria.dialCodes : [],
            createdBy: (criteria.createdBy && criteria.createdBy.length > 0) ? criteria.createdBy : [],
            gradeLevel: (criteria.grade && criteria.grade.length > 0) ? criteria.grade : [],
            medium: (criteria.medium && criteria.medium.length > 0) ? criteria.medium : [],
            board: (criteria.board && criteria.board.length > 0) ? criteria.board : [],
            language: (criteria.language && criteria.language.length > 0) ? criteria.language : [],
            topic: (criteria.topic && criteria.topic.length > 0) ? criteria.topic : [],
            purpose: (criteria.purpose && criteria.purpose.length > 0) ? criteria.purpose : [],
            channel: (criteria.channel && criteria.channel.length > 0) ? criteria.channel : [],
            audience: ['instructor'],

            // TODO Revisit on inclusion and exclusion filters
        };
    }

    getSortByRequest(sortCriteria: ContentSortCriteria[]): any {
        if (sortCriteria && sortCriteria.length === 0) {
            return {};
        }
        const attribute = sortCriteria[0].sortAttribute;
        const sortOrder: SortOrder = sortCriteria[0].sortOrder;
        return {attribute: sortOrder};
    }

    getCompatibilityLevelFilter(): any {
        return {'min': this.appConfig.minCompatibilityLevel, 'max': this.appConfig.maxCompatibilityLevel};
    }

    getRequest(request, framework: string, langCode: string): Request {
        return new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.contentServiceConfig.apiPath + this.SEARCH_ENDPOINT + '/' + '?framework=' + framework + '&lang=' + langCode)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody(request)
            .build();
    }

    createFiilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[], filters) {
        const facetsFilter: ContentSearchFilter[] = [];
        return {
            query: previouscriteria.query,
            limit: previouscriteria.limit,
            offset: previouscriteria.offset,
            facets: previouscriteria.facets,
            sort: previouscriteria.sortCriteria && previouscriteria.sortCriteria.length > 0
                ? previouscriteria.sortCriteria : [],
            mode: previouscriteria.mode === 'soft' ? 'soft' : 'hard',
            facetFilters: []
        };
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

    mapSearchResponse(searchResponse, searchRequest): ContentSearchResult {
        const result = searchResponse.result;
        return {
            id: searchResponse.id,
            responseMessageId: searchResponse.params.resmsgid ? searchResponse.params.resmsgid : '',
            contentDataList: result.content ? result.content : [],
            filterCriteria: new class implements ContentSearchCriteria {
                age: number;
                audience: string[];
                board: string[];
                channel: string[];
                contentStatusArray: string[];
                contentTypes: string[];
                createdBy: string[];
                dialCodes: string[];
                exclPragma: string[];
                exists: string[];
                facetFilters: ContentSearchFilter[];
                facets: string[];
                framework: string;
                grade: string[];
                impliedFilters: ContentSearchFilter[];
                impliedFiltersMap: Array<any>;
                keywords: string[];
                language: string[];
                languageCode: string;
                limit: number;
                medium: string[];
                mode: string;
                offlineSearch: boolean;
                offset: number;
                pragma: string[];
                purpose: string[];
                query: string;
                searchType: SearchType;
                sortCriteria: ContentSortCriteria[];
                topic: string[];
            },
            request: searchRequest
        };
    }
}
