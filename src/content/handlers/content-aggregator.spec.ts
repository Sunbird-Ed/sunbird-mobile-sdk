import {ContentAggregation, ContentAggregator, DataResponseMap} from './content-aggregator';
import {ContentAggregatorResponse, ContentService} from '..';
import {CachedItemStore} from '../../key-value-store';
import {of} from 'rxjs';
import {FormService} from '../../form';
import {CsContentsGroupGenerator} from '@project-sunbird/client-services/services/content/utilities/content-group-generator';
import {
    mockFormResponse,
    mockFormResponseWithTrackableCourseDataSrc,
    mockFormResponseWithTrackableDataSrc,
    mockGetOfflineContentsResponse,
    mockGetOfflineContentsResponseWithTwoSubjects,
    mockGetOnlineContentsResponse,
    mockFormResponseWithUnknownDataSrcNoValuesNoSearchFields,
    mockFormResponseWithUnknownDataSrcNoSearchField,
    mockFormResponseWithUnknownDataSrc
} from './content-aggregator.spec.data';
import {SearchContentHandler} from './search-content-handler';
import {CourseService} from '../../course';
import {ProfileService} from '../../profile';

describe('ContentAggregator', () => {
    let contentAggregator: ContentAggregator;
    const mockContentService: Partial<ContentService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockFormService: Partial<FormService> = {};
    const mockCourseService: Partial<CourseService> = {};
    const mockProfileService: Partial<ProfileService> = {};

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
            mockCachedItemStore as CachedItemStore,
            mockCourseService as CourseService,
            mockProfileService as ProfileService
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
            contentAggregator.aggregate({}, ['CONTENTS'], {
                type: 'config',
                subType: 'library',
                action: 'get',
                component: 'app',
            }).subscribe(() => {
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

        describe('ContentAggregatorRequest', () => {
            describe('when default - no optional arguments are passed', () => {
                it('should combine online and offline contents for all field configurations', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                    mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponse));
                    mockContentService.searchContent = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                    spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                    // act
                    contentAggregator.aggregate({}, ['TRACKABLE_CONTENTS'], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                            board: undefined,
                            medium: undefined,
                            grade: undefined,
                            primaryCategories: ['Explanation Content']
                        }));
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                            board: undefined,
                            medium: undefined,
                            grade: undefined,
                            primaryCategories: ['Digital Textbook']
                        }));

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
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(),
                                        searchRequest: expect.anything(),
                                    },
                                    data: {
                                        name: expect.any(String),
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
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>,
                                {
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(),
                                        searchRequest: expect.anything(),
                                    },
                                    data: {
                                        name: expect.any(String),
                                        sections: [
                                            {
                                                name: expect.any(String),
                                                count: 1,
                                                contents: [
                                                    expect.objectContaining({
                                                        identifier: 'do_2128458593096499201172'
                                                    }),
                                                ]
                                            },
                                            {
                                                name: expect.any(String),
                                                count: 1,
                                                contents: [
                                                    expect.objectContaining({
                                                        identifier: 'do_21280780867130982412259'
                                                    }),
                                                ]
                                            }
                                        ]
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>
                            ]
                        } as ContentAggregatorResponse);
                        done();
                    });
                });
            });

            describe('when applyFirstAvailableCombination optional argument is passed', () => {
                it('should combine online and offline contents for all field configurations and only return contents where firstAvailableCombination is applicable for a field', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                    mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponseWithTwoSubjects));
                    mockContentService.searchContent = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                    spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                    // act
                    contentAggregator.aggregate({
                        applyFirstAvailableCombination: {
                            'subject': ['Some other Physical Science'],
                            'gradeLevel': ['Class 1']
                        }
                    }, ['TRACKABLE_CONTENTS'], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                            board: undefined,
                            medium: undefined,
                            grade: undefined,
                            primaryCategories: ['Explanation Content']
                        }));
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                            board: undefined,
                            medium: undefined,
                            grade: undefined,
                            primaryCategories: ['Digital Textbook']
                        }));

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
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                    },
                                    data: {
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
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>,
                                {
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                    },
                                    data: {
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
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>
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
                    mockContentService.searchContent = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                    spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                    // act
                    contentAggregator.aggregate({
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
                    }, ['TRACKABLE_CONTENTS'], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(1, expect.objectContaining({
                            board: ['some_board'],
                            medium: ['some_medium'],
                            grade: ['some_grade'],
                            primaryCategories: ['Explanation Content']
                        }));
                        expect(mockContentService.getContents).toHaveBeenNthCalledWith(2, expect.objectContaining({
                            board: ['some_board'],
                            medium: ['some_medium'],
                            grade: ['some_grade'],
                            primaryCategories: ['Digital Textbook']
                        }));

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
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(),
                                        searchRequest: expect.anything(),
                                    },
                                    data: {
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
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>,
                                {
                                    title: expect.any(String),
                                    meta: {
                                        searchCriteria: expect.anything(), searchRequest: expect.anything(),
                                    },
                                    data: {
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
                                    },
                                    dataSrc: expect.any(Object),
                                    theme: expect.any(Object)
                                } as ContentAggregation<'CONTENTS'>
                            ]
                        });
                        done();
                    });
                });
            });
        });

        describe('dataSrc', () => {
            describe('when excludes is TRACKABLE_CONTENTS', () => {
                it('should avoid fetching enrolledCourses', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                    mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponse));
                    mockContentService.searchContent = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));
                    mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of({
                        uid: 'SOME_UID',
                        sid: 'SOME_SID'
                    }));
                    mockCourseService.getEnrolledCourses = jest.fn().mockImplementation(() => of([]));

                    // act
                    contentAggregator.aggregate({}, ['TRACKABLE_CONTENTS'], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockProfileService.getActiveProfileSession).not.toHaveBeenCalled();
                        expect(mockCourseService.getEnrolledCourses).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            describe('when excludes is not TRACKABLE_COURSE_CONTENTS', () => {
                it('should aggregate from enrolledCourses', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponseWithTrackableCourseDataSrc));
                    mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of({
                        uid: 'SOME_UID',
                        sid: 'SOME_SID'
                    }));
                    mockCourseService.getEnrolledCourses = jest.fn().mockImplementation(() => of([
                        {
                            content: {
                                primaryCategory: 'Course'
                            }
                        },
                        {
                            content: {
                                primaryCategory: 'Non-Course'
                            }
                        }
                    ]));

                    // act
                    contentAggregator.aggregate({}, ['CONTENTS'], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                        expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                            userId: 'SOME_UID',
                            returnFreshCourses: true
                        });
                        expect(result).toEqual({
                            'result': [{
                                'data': {
                                    'name': '0',
                                    'sections': [
                                        {
                                            'contents': [{'content': {'primaryCategory': 'Course'}}], 'count': 1, 'name': '0'
                                        }
                                    ]
                                },
                                'title': expect.any(String),
                                'dataSrc': expect.any(Object),
                                'theme': expect.any(Object),
                            }]
                        });
                        done();
                    });
                });
            });

            describe('when excludes is not TRACKABLE_CONTENTS', () => {
                it('should aggregate from enrolledCourses', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponseWithTrackableDataSrc));
                    mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of({
                        uid: 'SOME_UID',
                        sid: 'SOME_SID'
                    }));
                    mockCourseService.getEnrolledCourses = jest.fn().mockImplementation(() => of([
                        {
                            content: {
                                primaryCategory: 'Course'
                            }
                        },
                        {
                            content: {
                                primaryCategory: 'Non-Course'
                            }
                        }
                    ]));

                    // act
                    contentAggregator.aggregate({}, [], {
                        type: 'config',
                        subType: 'library',
                        action: 'get',
                        component: 'app',
                    }).subscribe((result) => {
                        // assert
                        expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                        expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                            userId: 'SOME_UID',
                            returnFreshCourses: true
                        });
                        expect(result).toEqual({
                            'result': [{
                                'data': {
                                    'name': '0',
                                    'sections': [
                                        {'contents': [{'content': {'primaryCategory': 'Non-Course'}}], 'count': 1, 'name': '0'}
                                    ]
                                },
                                'title': expect.any(String),
                                'dataSrc': expect.any(Object),
                                'theme': expect.any(Object),
                            }]
                        });
                        done();
                    });
                });
            });

            describe('unknown dataSrc is passed', () => {
                describe('when neither "search" nor "values" present', () => {
                    it('should return empty aggregation', (done) => {
                        // arrange
                        mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponseWithUnknownDataSrcNoValuesNoSearchFields));

                        // act
                        contentAggregator.aggregate({}, [], {
                            type: 'config',
                            subType: 'library',
                            action: 'get',
                            component: 'app',
                        }).subscribe((result) => {
                            // assert
                            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                            expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                                userId: 'SOME_UID',
                                returnFreshCourses: true
                            });
                            expect(result).toEqual({
                                'result': [{
                                    'data': [],
                                    'title': expect.any(String),
                                    'dataSrc': expect.any(Object),
                                    'theme': expect.any(Object),
                                }]
                            });
                            done();
                        });
                    });
                });

                describe('when "values" present', () => {
                    it('should return aggregation with values', (done) => {
                        // arrange
                        mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponseWithUnknownDataSrcNoSearchField));

                        // act
                        contentAggregator.aggregate({}, [], {
                            type: 'config',
                            subType: 'library',
                            action: 'get',
                            component: 'app',
                        }).subscribe((result) => {
                            // assert
                            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                            expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                                userId: 'SOME_UID',
                                returnFreshCourses: true
                            });
                            expect(result).toEqual({
                                'result': [{
                                    'data': [
                                        {'some': 'value'},
                                        {'some': 'value'},
                                    ],
                                    'title': expect.any(String),
                                    'dataSrc': expect.any(Object),
                                    'theme': expect.any(Object),
                                }]
                            });
                            done();
                        });
                    });
                });

                describe('when "search" present', () => {
                    it('should default to dataSrc: \'CONTENTS\'', (done) => {
                        // arrange
                        mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponseWithTrackableDataSrc));
                        mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponse));
                        mockContentService.searchContent = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                        // act
                        contentAggregator.aggregate({}, [], {
                            type: 'config',
                            subType: 'library',
                            action: 'get',
                            component: 'app',
                        }).subscribe((result) => {
                            // assert
                            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                            expect(mockCourseService.getEnrolledCourses).toHaveBeenCalledWith({
                                userId: 'SOME_UID',
                                returnFreshCourses: true
                            });
                            expect(result).toEqual({
                                result: [
                                    expect.any(Object),
                                ]
                            } as ContentAggregatorResponse);
                            done();
                        });
                    });
                });
            });
        });
    });
});
