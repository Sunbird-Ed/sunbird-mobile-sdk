import {ContentAggregator} from './content-aggregator';
import {ContentService} from '..';
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
    mockGetOnlineContentsResponse
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
                    mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));

                    spyOn(CsContentsGroupGenerator, 'generate').and.callThrough();

                    // act
                    contentAggregator.aggregate({}, ['CONTENTS'], {
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
                    contentAggregator.aggregate({
                        applyFirstAvailableCombination: {
                            'subject': ['Some other Physical Science'],
                            'gradeLevel': ['Class 1']
                        }
                    }, ['CONTENTS'], {
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
                    }, ['CONTENTS'], {
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

        describe('dataSrc', () => {
            describe('when default - no optional arguments are passed', () => {
                it('should assume dataSrc to be CONTENTS', (done) => {
                    // arrange
                    mockFormService.getForm = jest.fn().mockImplementation(() => of(mockFormResponse));
                    mockContentService.getContents = jest.fn().mockImplementation(() => of(mockGetOfflineContentsResponse));
                    mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of(mockGetOnlineContentsResponse));
                    mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of({
                        uid: 'SOME_UID',
                        sid: 'SOME_SID'
                    }));
                    mockCourseService.getEnrolledCourses = jest.fn().mockImplementation(() => of([]));

                    // act
                    contentAggregator.aggregate({}, ['CONTENTS'], {
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

            describe('when dataSrc is TRACKABLE_COURSE_CONTENTS', () => {
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
                                contentType: 'Course'
                            }
                        },
                        {
                            content: {
                                contentType: 'Non-Course'
                            }
                        }
                    ]));

                    // act
                    contentAggregator.aggregate({}, ['TRACKABLE_COURSE_CONTENTS'], {
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
                                'orientation': 'horizontal',
                                'section': {
                                    'name': '0',
                                    'sections': [
                                        {'contents': [{'contentType': 'Course'}], 'count': 1}
                                    ]
                                },
                                'title': '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}'
                            }]
                        });
                        done();
                    });
                });
            });

            describe('when dataSrc is TRACKABLE_CONTENTS', () => {
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
                                contentType: 'Course'
                            }
                        },
                        {
                            content: {
                                contentType: 'Non-Course'
                            }
                        }
                    ]));

                    // act
                    contentAggregator.aggregate({}, ['TRACKABLE_CONTENTS'], {
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
                                'orientation': 'horizontal',
                                'section': {
                                    'name': '0',
                                    'sections': [
                                        {'contents': [{'contentType': 'Non-Course'}], 'count': 1}
                                    ]
                                },
                                'title': '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}'
                            }]
                        });
                        done();
                    });
                });
            });
        });
    });
});
