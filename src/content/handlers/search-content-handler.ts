import {
    ContentDetailRequest,
    ContentSearchCriteria,
    ContentSearchFilter,
    ContentSortCriteria, FilterValue,
    SortOrder
} from '../def/requests';
import {ContentServiceConfig} from '../config/content-config';
import {SessionAuthenticator} from '../../auth';
import {ApiService, HttpRequestType, Request} from '../../api';
import {AppConfig} from '../../api/config/app-config';
import {ContentData} from '../def/content';
import {ContentSearchResult} from '../def/response';
import {SearchType} from '../util/content-constats';

export class SearchContentHandler {

    public static readonly AUDIENCE_LEARNER = ['learner'];
    public static readonly AUDIENCE_INSTRUCTOR = ['instructor'];
    private readonly SEARCH_ENDPOINT = 'search';

    constructor(private appConfig: AppConfig,
                private contentServiceConfig: ContentServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getSearchContentRequest(criteria: ContentSearchCriteria): any {
        return {
            'query': criteria.query,
            'offset': criteria.offset,
            'limit': criteria.limit,
            'mode': criteria.mode,
            'exists': (criteria.exists && criteria.exists.length > 0) ? criteria.exists : [],
            'facets': (criteria.facets && criteria.facets.length > 0) ? criteria.facets : [],
            'sort_by': this.getSortByRequest(criteria.sortCriteria),
            'filters': this.getSearchFilter(criteria)
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
            'compatibilityLevel': this.getCompatibilityLevelFilter(),
            'status': criteria.contentStatusArray,
            'objectType': ['Content'],
            'contentType': (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : [],
            'keywords': (criteria.keywords && criteria.keywords.length > 0) ? criteria.keywords : [],
            'createdBy': (criteria.createdBy && criteria.createdBy.length > 0) ? criteria.createdBy : [],
            'gradeLevel': (criteria.grade && criteria.grade.length > 0) ? criteria.grade : [],
            'medium': (criteria.medium && criteria.medium.length > 0) ? criteria.medium : [],
            'board': (criteria.board && criteria.board.length > 0) ? criteria.board : [],
            'language': (criteria.language && criteria.language.length > 0) ? criteria.language : [],
            'audience': ['instructor'], // TODO add Audience and pragma
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
            .withInterceptors([this.sessionAuthenticator])
            .withBody(request)
            .build();
    }

    createFiilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[], filters) {

        // return {
        //     'query': previouscriteria.query,
        //     'limit': previouscriteria.limit,
        //     'offset': previouscriteria.offset,
        //     'facets': previouscriteria.facets,
        //     'sort': previouscriteria.sortCriteria && previouscriteria.sortCriteria.length > 0
        //         ? previouscriteria.sortCriteria : [],
        //     'mode': previouscriteria.mode === 'soft' ? 'soft' : 'hard',
        //     'facetFilters': []
        // };
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
            let applied = false;
            if (appliedFilter && appliedFilter.indexOf(name) > -1) {
                applied = true;
            }
            facetValue.apply = applied;
        });
        return facetValues;
    }

    // mapSearchResponse(searchResponse): ContentSearchResult {
    //     // return {
    //     //     'id': searchResponse.id,
    //     //     'responseMessageId': searchResponse.params ? searchResponse.params.resmsgid : '',
    //     //     'contentDataList': searchResponse.result.content ? searchResponse.result.content : [],
    //     //     'facets': searchResponse.result ? searchResponse.result.facets : [],
    //     //
    //     // };
    // }
}
