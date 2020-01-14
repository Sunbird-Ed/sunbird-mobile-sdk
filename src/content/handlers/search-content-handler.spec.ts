import { ContentServiceConfig } from '../config/content-config';
import { SearchContentHandler } from './search-content-handler';
import { TelemetryService, ContentSortCriteria } from '../..';
import { AppConfig } from '../../api/config/app-config';
import { SortOrder, ContentSearchCriteria, ContentSearchFilter, FilterValue, ContentImport } from '../def/requests';
import { SearchFilter } from '../def/search-request';
import { SearchType } from '../util/content-constants';
import { of } from 'rxjs';
import { identifier } from '@babel/types';

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
                sort_by: 'sort_by',
                filters: 'filters',
                facets: 'facets'
            }
        };
        const sortCriteria: ContentSortCriteria[] = [];
        const criteria: ContentSortCriteria = {
            sortAttribute: 'key',
            sortOrder: SortOrder.ASC
        };
        sortCriteria.push(criteria);
        const filterMap: SearchFilter = {
            contentType: ['SAMPLE_CONTENT_TYPE']
        };
        // act
        searchContentHandler.getSearchCriteria(request);
        // assert
        expect(sortCriteria[0]).toEqual(criteria);
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

    it('should sort all Attributes to invocked getSortByRequest()', () => {
        // arrange
        const sortCriteria: ContentSortCriteria[] = [{
            sortAttribute: 'key',
            sortOrder: SortOrder.ASC
        }];
        // act
        searchContentHandler.getSortByRequest(sortCriteria);
        // assert
        expect(sortCriteria[0].sortAttribute).toBe('key');
        expect(sortCriteria[0].sortOrder).toBe('asc');
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
        const appliedFilterMap: SearchFilter = { contentType: ['SAMPLE_CONTENT_TYPE'] };
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

        mockTelemetryService.interact = jest.fn(() => of([]));
        // act
        searchContentHandler.buildContentLoadingEvent(subType, contentImport, '', '');
        // assert
        expect(mockTelemetryService.interact).toHaveBeenCalled();
    });
});
