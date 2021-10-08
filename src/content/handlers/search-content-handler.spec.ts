import { SearchContentHandler } from './search-content-handler';
import {
    ContentImport,
    ContentSearchCriteria,
    ContentSearchFilter,
    ContentServiceConfig,
    ContentSortCriteria,
    FilterValue,
    SearchType,
    SortOrder,
    TelemetryService,
    MimeType,
    InteractType,
    SearchResponse,
    ContentData
} from '../..';
import { AppConfig } from '../../api/config/app-config';
import { SearchFilter, SearchRequest } from '../def/search-request';
import { of } from 'rxjs';

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
        const filterMap: SearchFilter = {
            contentType: ['SAMPLE_CONTENT_TYPE']
        };
        const request = {
            request: {
                query: 'Sample_query',
                exists: 'Sample_exists',
                limit: 'Sample_limit',
                offset: 'Sample_offset',
                mode: 'soft',
                sort_by: {
                    key1: 'asc',
                    key2: 'desc',
                    key3: ''
                },
                filters: filterMap,
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
        const criteria3: ContentSortCriteria = {
            sortAttribute: 'key3',
            sortOrder: ''
        } as any;
        sortCriteria.push(criteria3);
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
                mode: 'mode',
                filters: 'filters',
                searchType: SearchType.SEARCH
            }
        };
        // act
        searchContentHandler.getSearchCriteria(request);
        // assert
        expect(request.request.query).toBe('Sample_query');
        done();
    });

    it('should search content sort criteria for error case of searchType is undefined', (done) => {
        // arrange
        const request = {
            request: {
                query: 'Sample_query',
                mode: 'mode',
                filters: 'filters'
            }
        };
        // act
        searchContentHandler.getSearchCriteria(request);
        // assert
        expect(request.request.query).toBe('Sample_query');
        done();
    });

    describe('getSearchContentRequest', () => {
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
            // act
            searchContentHandler.getSearchContentRequest(criteria);
            // assert
            expect(criteria.searchType).toBe('search');
            expect(criteria.query).toBe('SAMPLE_QUERY');
            expect(criteria.exists!.length).toBeGreaterThan(0);
        });

        it('should added subject filter and searchRequest for required fields and searchType as empty', () => {
            // arrange
            const criteria: ContentSearchCriteria = {
                searchType: '',
                query: 'SAMPLE_QUERY',
                offset: 1,
                limit: 2,
                mode: 'SAMPLE_MODE',
                facets: [],
                exists: ['SAMPLE_1', 'SAMPLE_2']
            } as any;
            // act
            searchContentHandler.getSearchContentRequest(criteria);
            // assert
            expect(criteria.searchType).toBe('');
            expect(criteria.query).toBe('SAMPLE_QUERY');
            expect(criteria.exists!.length).toBeGreaterThan(0);
        });

        it('should added subject filter and searchRequest for required fields and searchType as FILTER', () => {
            // arrange
            const criteria: ContentSearchCriteria = {
                searchType: SearchType.FILTER
            };
            // act
            searchContentHandler.getSearchContentRequest(criteria);
            expect(criteria.searchType).toBe('filter');
            // assert
        });

        it('should added filter for search request to invoked addFiltersToRequest()', () => {
            // arrange
            const valueRequest: FilterValue[] = [
                {
                    name: 'SAMPLE_NAME',
                    apply: true
                },
                {
                    name: 'SAMPLE_NAME_1',
                    apply: false
                }
            ];
            const facetFilters: ContentSearchFilter[] = [{
                name: 'SAMPLE_CONTENT',
                values: valueRequest
            }];
            const criteria: ContentSearchCriteria = {
                searchType: SearchType.FILTER,
                query: 'SAMPLE_QUERY',
                offset: 1,
                limit: 2,
                mode: 'SAMPLE_MODE',
                facets: [],
                exists: ['SAMPLE_1', 'SAMPLE_2'],
                facetFilters: facetFilters,
                impliedFiltersMap: [{
                    filter: 'sample-filter'
                }]
            };
            // const searchFilter: SearchFilter = {};
            // act
            const searchRequest = searchContentHandler.getSearchContentRequest(criteria);
            // assert
            expect(searchRequest.filters).toEqual({
                SAMPLE_CONTENT: ['SAMPLE_NAME'],
                filter: 'sample-filter'
            });
        });

        it('should added filter for search request', () => {
            // arrange
            const criteria: ContentSearchCriteria = {
                facets: ['sample facets'],
                searchType: SearchType.SEARCH,
                contentTypes: ['sample_content_type'],
                keywords: ['sample keyword'],
                dialCodes: ['sample dialcode'],
                createdBy: ['sample createdBy'],
                grade: ['sample grade'],
                medium: ['Sample Medium'],
                board: ['Sample board'],
                language: ['Sample language'],
                topic: ['Sample topic'],
                purpose: ['Sample purpose'],
                channel: ['Sample channel'],
                mimeType: ['sample mimeType'],
                subject: ['sample subject']
            };
            // act
            const searchRequest = searchContentHandler.getSearchContentRequest(criteria);
            console.log('searchRequest.filters: ', searchRequest.filters);
            // assert
            expect(searchRequest.filters).toEqual({
                status: undefined,
                audience: [],
                objectType: ['Content' , 'QuestionSet'],
                contentType: ['sample_content_type'],
                keywords: ['sample keyword'],
                dialcodes: ['sample dialcode'],
                createdBy: ['sample createdBy'],
                se_gradeLevels: ['sample grade'],
                se_mediums: ['Sample Medium'],
                se_boards: ['Sample board'],
                language: ['Sample language'],
                topic: ['Sample topic'],
                purpose: ['Sample purpose'],
                channel: ['Sample channel'],
                mimeType: ['sample mimeType'],
                subject: ['sample subject'],
                primaryCategory: []
            }
            );
        });
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

    describe('createFilterCriteria', () => {
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
                name: 'sample name',
                apply: true
            }];
            const facets: ContentSearchFilter[] = [{
                name: 'status',
                values: valueRequest
            }];
            const appliedFilterMap: SearchFilter = { contentType: ['SAMPLE_CONTENT_TYPE'], 'status': ['SAMPLE NAME']};
            // act
            const data = searchContentHandler.createFilterCriteria(previouscriteria, facets, appliedFilterMap);
            // assert
            expect(data).toBeTruthy();
            expect(previouscriteria.mode).toBe('soft');
            expect(previouscriteria.sortCriteria!.length).toBeGreaterThan(0);
        });

        it('should create filter by previousCriteria and return contentFilterCriteria for facetValue does not match', () => {
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
                name: 'sample name',
                apply: true
            }];
            const facets: ContentSearchFilter[] = [{
                name: 'status',
                values: valueRequest
            }];
            const appliedFilterMap: SearchFilter = { contentType: ['SAMPLE_CONTENT_TYPE'], 'status': ['SAMPLE_NAME']};
            // act
            const data = searchContentHandler.createFilterCriteria(previouscriteria, facets, appliedFilterMap);
            // assert
            expect(previouscriteria.mode).toBe('soft');
            expect(previouscriteria.sortCriteria!.length).toBeGreaterThan(0);
            expect(data).toBeTruthy();
        });

        it('should create filter by previousCriteria and return contentFilterCriteria if appliedFilter is undefined', () => {
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
                name: 'sample name',
                apply: true
            }];
            const facets: ContentSearchFilter[] = [{
                name: 'sample-name',
                values: valueRequest
            }];
            const appliedFilterMap: SearchFilter = { contentType: ['SAMPLE_CONTENT_TYPE'], 'status': ['SAMPLE_NAME']};
            // act
           const data = searchContentHandler.createFilterCriteria(previouscriteria, facets, appliedFilterMap);
            // assert
            expect(data).toBeTruthy();
            expect(previouscriteria.mode).toBe('soft');
            expect(previouscriteria.sortCriteria!.length).toBeGreaterThan(0);
        });
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

    it('should not added filter value for empty error', () => {
        // arrange
        const facets: ContentSearchFilter[] = [];
        const filter = 'SAMPLE_FILTER';
        // act
        searchContentHandler.addFilterValue(facets, filter);
        // assert
        expect(facets.length).toBe(0);
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

    describe('getDownloadUrl', () => {
        it('should return downloadUrl for online scenario', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.COLLECTION.valueOf(),
                variants: {
                    online: {
                        ecarUrl: 'http://sample-ecar-url'
                    }
                },
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'online',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return downloadUrl for spine scenario', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.COLLECTION.valueOf(),
                variants: {
                    spine: {
                        ecarUrl: 'http://sample-ecar-url'
                    }
                },
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'spine',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return contentData downloadUrl if variants is undefined', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.COLLECTION.valueOf(),
                downloadUrl: '  https://sample/download/url',
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'full',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return contentData downloadUrl if mimeType is not matched', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.ECAR,
                downloadUrl: '  https://sample/download/url',
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'full',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should parse the varients data if the api response is stringified JSON', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.COLLECTION.valueOf(),
                variants: "{\"online\":{\"ecarUrl\":\"http://sample-ecar-url\"}}",
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'online',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return contentData downloadUrl the varient is not stringified JSON', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.ECAR,
                variants: "http://sample-ecar-url",
                downloadUrl: '  https://sample/download/url',
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'collection' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'collection' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'full',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return downloadUrl for full scenario for QuestionSet', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.QUESTION_SET,
                variants: {
                    full: {
                        ecarUrl: 'http://sample-ecar-url'
                    }
                },
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'question-set' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'question-set' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'full',
                    type: InteractType.OTHER
                });
                done();
            });
        });

        it('should return downloadUrl for online scenario for QuestionSet', (done) => {
            // arrange
            const contentData = {
                mimeType: MimeType.QUESTION_SET,
                variants: {
                    online: {
                        ecarUrl: 'http://sample-ecar-url'
                    }
                },
                contentType: 'ecar',
                pkgVersion: 'v-1'
            } as any;
            const contentImport = {
                contentId: 'do-123',
                rollUp: { l1: 'do-123' },
                correlationData: [{ id: 'do-123', type: 'question-set' }]
            } as any;
            mockTelemetryService.interact = jest.fn(() => of(true));
            // act
            searchContentHandler.getDownloadUrl(contentData, contentImport).then(() => {
                expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                    correlationData: [{ id: 'do-123', type: 'question-set' }],
                    id: 'ImportContent',
                    objId: contentImport.contentId,
                    objType: contentData.contentType,
                    objVer: contentData.pkgVersion,
                    pageId: 'ImportContent',
                    pos: [],
                    rollup: { l1: 'do-123' },
                    subType: 'online',
                    type: InteractType.OTHER
                });
                done();
            });
        });

    });

    it('should return constentSearchResult', () => {
        const sortCriteria: ContentSortCriteria[] = [{
            sortAttribute: 'key',
            sortOrder: SortOrder.ASC
        }];
        const previouscriteria: ContentSearchCriteria = {
            searchType: SearchType.SEARCH,
            mode: 'soft',
            sortCriteria: sortCriteria
        };
        const searchResponse: SearchResponse = {
            id: 'search-id',
            params: { resmsgid: 'message-id' },
            result: {
                count: 1,
                content: [{identifier: 'do-123'}] as any,
                collections: [{identifier: 'do-123'}] as any,
                facets: undefined
            }
        } as any;
        const searchRequest: SearchRequest = {
            filters: {} as any
        } as any;
        // act
        const data = searchContentHandler.mapSearchResponse(previouscriteria, searchResponse, searchRequest);
        // assert
        expect(data).not.toBeUndefined();
    });

    it('should return SearchRequest', () => {
        const contentIds = ['do-123', 'do-234'];
        const fields = ['identifier', 'name'];
        // act
        const data = searchContentHandler.getContentSearchFilter(contentIds, fields);
        // assert
        expect(data).not.toBeUndefined();
    });
});
