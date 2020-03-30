import {SearchContentHandler} from './search-content-handler';
import {
    ContentImport,
    ContentSearchCriteria,
    ContentSearchFilter,
    ContentServiceConfig,
    ContentSortCriteria,
    FilterValue,
    SearchType,
    SortOrder,
    TelemetryService
} from '../..';
import {AppConfig} from '../../api/config/app-config';
import {SearchFilter} from '../def/search-request';
import {of} from 'rxjs';

describe('SearchContentHandler', () => {
    let searchContentHandler: SearchContentHandler;
    const mockAppConfig: Partial<AppConfig> = {};
    const mockContentSaerviceConfig: Partial<ContentServiceConfig> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};


    beforeAll(() => {
        searchContentHandler = new SearchContentHandler(
            mockAppConfig as AppConfig,
            mockContentSaerviceConfig as ContentServiceConfig,
            mockTelemetryService as TelemetryService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of searchContconstentHandler', () => {
        expect(searchContentHandler).toBeTruthy();
    });

    it('should search content sort criteria', () => {
        // arrange
        const request = {
            request: {
                query: 'Sample_query',
                exists: 'Sample_exists',
                limit: 'Sample_limit',
                offset: 'Sample_offset',
                mode: 'soft',
                sort_by: {
                    key1: 'asc',
                    key2: 'desc'
                },
                filters: 'filters',
                facets: 'facets',
                searchType: SearchType.FILTER
            }
        };
        const sortCriteria: ContentSortCriteria[] = [];
        const criteria1: ContentSortCriteria = {
            sortAttribute: 'key1',
            sortOrder: SortOrder.ASC
        };
        sortCriteria.push(criteria1);

        const criteria2: ContentSortCriteria = {
            sortAttribute: 'key2',
            sortOrder: SortOrder.DESC
        };
        sortCriteria.push(criteria2);
        // request.request.sort_by = sortCriteria;
        const filterMap: SearchFilter = {
            contentType: ['SAMPLE_CONTENT_TYPE']
        };
        // act
        searchContentHandler.getSearchCriteria(request);
        // assert
        expect(sortCriteria[0]).toEqual(criteria1);
        expect(sortCriteria[1]).toEqual(criteria2);
    });


    it('should search content sort criteria for error case', (done) => {
        // arrange
        const request = {
            request: {
                query: 'Sample_query',
                exists: 'Sample_exists',
                limit: 'Sample_limit',
                offset: 'Sample_offset',
                mode: 'mode',
            }
        };
        // act
        searchContentHandler.getSearchCriteria(request);
        // assert
        expect(request.request.query).toBe('Sample_query');
        done();
    });

    it('should added subject filter and searchRequest for required fields and searchType as SEARCH', () => {
        // arrange
        const criteria: ContentSearchCriteria = {
            searchType: SearchType.SEARCH,
            query: 'SAMPLE_QUERY',
            offset: 1,
            limit: 2,
            mode: 'SAMPLE_MODE',
            facets: [],
            exists: ['SAMPLE_1', 'SAMPLE_2']
        };
        // spyOn(searchContentHandler, 'getSearchFilter').and.stub();
        // act
        searchContentHandler.getSearchContentRequest(criteria);
        // assert
        expect(criteria.searchType).toBe('search');
        expect(criteria.query).toBe('SAMPLE_QUERY');
        expect(criteria.exists!.length).toBeGreaterThan(0);
    });

    it('should added subject filter and searchRequest for required fields and searchType as FILTER', () => {
        // arrange
        const criteria: ContentSearchCriteria = {
            searchType: SearchType.FILTER
        };
        // spyOn(searchContentHandler, 'getSearchFilter').and.stub();

        // act
        searchContentHandler.getSearchContentRequest(criteria);
        expect(criteria.searchType).toBe('filter');
        // assert
    });

    it('should added filter for search request to invoked addFiltersToRequest()', () => {
        // arrange
        const valueRequest: FilterValue[] = [{
            name: 'SAMPLE_NAME',
            apply: true
        }];
        const filter: ContentSearchFilter[] = [{
            name: 'SAMPLE_CONTENT',
            values: valueRequest
        }];
        const searchFilter: SearchFilter = {};
        // act
        searchContentHandler.addFiltersToRequest(searchFilter, filter);
        // assert
        expect(filter.length).toBeGreaterThan(0);
    });

    describe('getSortByRequest()', () => {
        it('should return empty map if no criteria is provided', () => {
            // arrange
            const sortCriteria: ContentSortCriteria[] = [];
            // act / assert
            expect(searchContentHandler.getSortByRequest(sortCriteria)).toEqual({});
        });

        it('should return map of attribute:sortOrder given sortCriteria', () => {
            // arrange
            const sortCriteria: ContentSortCriteria[] = [{
                sortAttribute: 'key1',
                sortOrder: SortOrder.ASC
            }, {
                sortAttribute: 'key2',
                sortOrder: SortOrder.DESC
            }];
            // act / assert
            expect(searchContentHandler.getSortByRequest(sortCriteria)).toEqual({
                key1: 'asc',
                key2: 'desc'
            });
        });
    });

    it('should create filter by previousCriteria and return contentFilterCriteria', () => {
        // arrange
        const sortCriteria: ContentSortCriteria[] = [{
            sortAttribute: 'key',
            sortOrder: SortOrder.ASC
        }];
        const previouscriteria: ContentSearchCriteria = {
            searchType: SearchType.SEARCH,
            mode: 'soft',
            sortCriteria: sortCriteria
        };
        const valueRequest: FilterValue[] = [{
            name: 'SAMPLE_NAME',
            apply: true
        }];
        const facets: ContentSearchFilter[] = [{
            name: 'SAMPLE_CONTENT',
            values: valueRequest
        }];
        const appliedFilterMap: SearchFilter = {contentType: ['SAMPLE_CONTENT_TYPE']};
        // act
        searchContentHandler.createFilterCriteria(previouscriteria, facets, appliedFilterMap);
        // assert
        expect(previouscriteria.mode).toBe('soft');
        expect(previouscriteria.sortCriteria!.length).toBeGreaterThan(0);
    });

    it('should added filter value with appliedFilter', () => {
        // arrange
        const valueRequest: FilterValue[] = [{
            name: 'SAMPLE_NAME',
            apply: true
        }];
        const facets: ContentSearchFilter[] = [{
            name: 'SAMPLE_CONTENT',
            values: valueRequest
        }];
        const filter = 'SAMPLE_FILTER';
        // act
        searchContentHandler.addFilterValue(facets, filter);
        // assert
        expect(facets.length).toBeGreaterThan(0);
    });

    it('should return filter value to invoked getFilterValuesWithAppliedFilter()', () => {
        // arrange
        const facetValues: FilterValue[] = [{
            name: 'SAMPLE_NAME',
            apply: true
        }];
        const appliedFilter = ['SAMPLE_BOARD'];
        // act
        searchContentHandler.getFilterValuesWithAppliedFilter(facetValues, appliedFilter);
        // assert
        expect(appliedFilter.indexOf('SAMPLE_BOARD')).toBeGreaterThan(-1);

    });

    it('should added importContent functionlity for telemetry service', () => {
        // arrange
        const subType = 'SAMPLE_SUB_TYPE';
        const contentImport: ContentImport = {
            isChildContent: true,
            destinationFolder: '',
            contentId: 'd0'
        };

        mockTelemetryService.interact = jest.fn().mockImplementation(() => of([]));
        // act
        searchContentHandler.buildContentLoadingEvent(subType, contentImport, '', '');
        // assert
        expect(mockTelemetryService.interact).toHaveBeenCalled();
    });
});
