import {ContentAggregator} from './content-aggregator';
import {ContentService} from '..';
import {CachedItemStore} from '../../key-value-store';
import {of} from 'rxjs';
import {FormService} from '../../form';
import {CsContentsGroupGenerator} from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import {
    mockFormResponse,
    mockGetOfflineContentsResponse,
    mockGetOfflineContentsResponseWithTwoSubjects,
    mockGetOnlineContentsResponse
} from './content-aggregator.spec.data';
import {SearchContentHandler} from './search-content-handler';

describe('ContentAggregator', () => {
    let contentAggregator: ContentAggregator;
    const mockContentService: Partial<ContentService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockFormService: Partial<FormService> = {};

    beforeAll(() => {
        const searchContentHandler = new SearchContentHandler(
            {maxCompatibilityLevel: 12} as any,
            undefined as any,
            undefined as any,
        );

        contentAggregator = new ContentAggregator(
            searchContentHandler as SearchContentHandler,
            mockFormService as FormService,
            mockContentService as ContentService,
            mockCachedItemStore as CachedItemStore
        );
    });

    it('should be able to create an instance', () => {
        expect(contentAggregator).toBeTruthy();
    });

    describe('handle()', () => {
        it('should fetch configuration using form API', (done) => {
            // arrange
            mockFormService.getForm = jest.fn(() => {
                return of({
                    form: {
                        data: {
                            fields: []
                        }
                    }
                });
            });

            // act
            contentAggregator.handle({}).subscribe(() => {
                // assert
                expect(mockFormService.getForm).toHaveBeenCalledWith({
                    type: 'config',
                    subType: 'library',
                    action: 'get',
                    component: 'app'
                });
                done();
            });
        });

        describe('when default - no optional arguments are passed', () => {
            it('should combine online and offline contents for all field configurations', (done) => {
                // arrange
                mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponse));
                mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                // act
                contentAggregator.handle({}).subscribe((result) => {
                    // assert
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                        board: undefined,
                        medium: undefined,
                        grade: undefined,
                        primaryCategories: []
                    }));
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                        board: undefined,
                        medium: undefined,
                        grade: undefined
                    }));

                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        1,
                        '27e83b402d63d832821e756b5b5d841600289088',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );
                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        2,
                        '27e83b402d63d832821e756b5b5d841600289088',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );

                    expect(CsContentsGroupGenerator.generate).toHaveBeenNthCalledWith(
                        1,
                        expect.arrayContaining([
                            expect.objectContaining({identifier: 'do_21280780867130982412259'}),
                            expect.objectContaining({identifier: 'do_2128458593096499201172'})
                        ]),
                        'subject',
                        [
                            {
                                sortAttribute: 'name',
                                sortOrder: 'asc'
                            }
                        ],
                        undefined
                    );

                    expect(result).toEqual({
                        result: [
                            {
                                title: '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}',
                                orientation: 'horizontal',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: '0',
                                    sections: [
                                        {
                                            count: 2,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'do_21280780867130982412259'
                                                }),
                                                expect.objectContaining({
                                                    identifier: 'do_2128458593096499201172'
                                                }),
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                title: '{"en":"Digital TextBook","hi":"डिजिटल टेक्स्टबुक"}',
                                orientation: 'vertical',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: 'subject',
                                    sections: [
                                        {
                                            name: 'English',
                                            count: 1,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'do_2128458593096499201172'
                                                }),
                                            ]
                                        },
                                        {
                                            name: 'Physical Science',
                                            count: 1,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'do_21280780867130982412259'
                                                }),
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    });
                    done();
                });
            });
        });

        describe('when applyFirstAvailableCombination optional argument is passed', () => {
            it('should combine online and offline contents for all field configurations and only return contents where firstAvailableCombination is applicable for a field', (done) => {
                // arrange
                mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponseWithTwoSubjects));
                mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                // act
                contentAggregator.handle({
                    applyFirstAvailableCombination: {
                        'subject': ['Some other Physical Science'],
                        'gradeLevel': ['Class 1']
                    }
                }).subscribe((result) => {
                    // assert
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                        board: undefined,
                        medium: undefined,
                        grade: undefined,
                        primaryCategories: []
                    }));
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                        board: undefined,
                        medium: undefined,
                        grade: undefined
                    }));

                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        1,
                        '27e83b402d63d832821e756b5b5d841600289088',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );
                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        2,
                        '27e83b402d63d832821e756b5b5d841600289088',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );

                    expect(CsContentsGroupGenerator.generate).toHaveBeenNthCalledWith(
                        1,
                        expect.arrayContaining([
                            expect.objectContaining({identifier: 'do_21280780867130982412259'}),
                            expect.objectContaining({identifier: 'do_2128458593096499201172'})
                        ]),
                        'subject',
                        [
                            {
                                sortAttribute: 'name',
                                sortOrder: 'asc'
                            }
                        ],
                        {
                            'subject': ['Some other Physical Science'],
                            'gradeLevel': ['Class 1']
                        }
                    );

                    expect(result).toEqual({
                        result: [
                            {
                                title: '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}',
                                orientation: 'horizontal',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: '0',
                                    sections: [
                                        {
                                            count: 3,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'do_21280780867130982412259'
                                                }),
                                                expect.objectContaining({
                                                    identifier: 'some_other_do_21280780867130982412259'
                                                }),
                                                expect.objectContaining({
                                                    identifier: 'do_2128458593096499201172'
                                                }),
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                title: '{"en":"Digital TextBook","hi":"डिजिटल टेक्स्टबुक"}',
                                orientation: 'vertical',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: 'subject',
                                    combination: {
                                        subject: 'Some other Physical Science',
                                        gradeLevel: 'Class 1',
                                    },
                                    sections: [
                                        {
                                            name: 'Some other Physical Science',
                                            count: 1,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'some_other_do_21280780867130982412259'
                                                })
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    });
                    done();
                });
            });
        });

        describe('when interceptSearchCriteria optional argument is passed', () => {
            it('should combine online and offline contents for all field configurations and only use adapted searchRequest', (done) => {
                // arrange
                mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponseWithTwoSubjects));
                mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                // act
                contentAggregator.handle({
                    applyFirstAvailableCombination: {
                        'subject': ['Some other Physical Science'],
                        'gradeLevel': ['Class 1']
                    },
                    interceptSearchCriteria: (criteria) => {
                        criteria.board = ['some_board'];
                        criteria.medium = ['some_medium'];
                        criteria.grade = ['some_grade'];
                        return criteria;
                    }
                }).subscribe((result) => {
                    // assert
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                        board: ['some_board'],
                        medium: ['some_medium'],
                        grade: ['some_grade'],
                        primaryCategories: []
                    }));
                    expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                        board: ['some_board'],
                        medium: ['some_medium'],
                        grade: ['some_grade']
                    }));

                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        1,
                        '78b675beed0b4ef73da507eca39195ebf750913e',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );
                    expect(mockCachedItemStore.getCached).toHaveBeenNthCalledWith(
                        2,
                        '78b675beed0b4ef73da507eca39195ebf750913e',
                        'search_content_grouped',
                        'ttl_search_content_grouped',
                        expect.anything(),
                        undefined,
                        undefined,
                        expect.anything(),
                    );

                    expect(CsContentsGroupGenerator.generate).toHaveBeenNthCalledWith(
                        1,
                        expect.arrayContaining([
                            expect.objectContaining({identifier: 'do_21280780867130982412259'}),
                            expect.objectContaining({identifier: 'do_2128458593096499201172'})
                        ]),
                        'subject',
                        [
                            {
                                sortAttribute: 'name',
                                sortOrder: 'asc'
                            }
                        ],
                        {
                            'subject': ['Some other Physical Science'],
                            'gradeLevel': ['Class 1']
                        }
                    );

                    expect(result).toEqual({
                        result: [
                            {
                                title: '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}',
                                orientation: 'horizontal',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: '0',
                                    sections: [
                                        {
                                            count: 3,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'do_21280780867130982412259'
                                                }),
                                                expect.objectContaining({
                                                    identifier: 'some_other_do_21280780867130982412259'
                                                }),
                                                expect.objectContaining({
                                                    identifier: 'do_2128458593096499201172'
                                                }),
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                title: '{"en":"Digital TextBook","hi":"डिजिटल टेक्स्टबुक"}',
                                orientation: 'vertical',
                                searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                section: {
                                    name: 'subject',
                                    combination: {
                                        subject: 'Some other Physical Science',
                                        gradeLevel: 'Class 1',
                                    },
                                    sections: [
                                        {
                                            name: 'Some other Physical Science',
                                            count: 1,
                                            contents: [
                                                expect.objectContaining({
                                                    identifier: 'some_other_do_21280780867130982412259'
                                                })
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    });
                    done();
                });
            });
        });
    });
});
