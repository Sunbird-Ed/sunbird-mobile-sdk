import { ContentServiceConfig } from '../config/content-config';
import { SearchContentHandler } from './search-content-handler';
import { TelemetryService, ContentSortCriteria } from '../..';
import { AppConfig } from '../../api/config/app-config';
import { SortOrder, ContentSearchCriteria, ContentSearchFilter, FilterValue } from '../def/requests';
import { SearchFilter } from '../def/search-request';
import { SearchType } from '../util/content-constants';
import { Observable } from 'rxjs';

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
    });


    it('should search content sort criteria for error case', () => {
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
    });

    it('should added subject filter and searchRequest for required fields and searchType as SEARCH', () => {
        // arrange
        const criteria: ContentSearchCriteria = {
            searchType: SearchType.SEARCH
        };
        // spyOn(searchContentHandler, 'getSearchFilter').and.stub();
        // act
        searchContentHandler.getSearchContentRequest(criteria);
        // assert
    });

    it('should added subject filter and searchRequest for required fields and searchType as FILTER', () => {
        // arrange
        const criteria: ContentSearchCriteria = {
            searchType: SearchType.FILTER
        };
        // spyOn(searchContentHandler, 'getSearchFilter').and.stub();
        // act
        searchContentHandler.getSearchContentRequest(criteria);
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
    });

    it('should create filter by previousCriteria and return contentFilterCriteria', () => {
        // arrange
        const previouscriteria: ContentSearchCriteria = {
            searchType: SearchType.SEARCH
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
    });

    it('should added importContent functionlity for telemetry service', () => {
        // arrange
        const subType = 'SAMPLE_SUB_TYPE';
        const identifier = 'SAMPLE_IDENTIFIER';
        mockTelemetryService.interact = jest.fn(() => Observable.of([]));
        // act
        searchContentHandler.buildContentLoadingEvent(subType, identifier);
        // assert
    });
});
