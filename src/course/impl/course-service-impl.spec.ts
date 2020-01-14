import {CourseServiceImpl} from './course-service-impl';
import {Container} from 'inversify';
import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest, GetContentStateRequest,
    UnenrollCourseRequest,
    UpdateContentStateRequest
} from '..';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {mockSdkConfigWithCourseConfig} from './course-service-impl.spec.data';
import {ApiService} from '../../api';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {DbService} from '../../db';
import {SharedPreferences} from '../../util/shared-preferences';
import {AuthService} from '../../auth';
import {of} from 'rxjs';
import {AppInfo} from '../../util/app';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {ContentStatesSyncHandler} from '../handlers/content-states-sync-handler';

jest.mock('../handlers/offline-content-state-handler');
jest.mock('../handlers/content-states-sync-handler');

describe('CourseServiceImpl', () => {
    let courseService: CourseService;

    const container = new Container();

    const mockApiService: Partial<ApiService> = {
        fetch: jest.fn(() => {
        })
    };
    const mockProfileService: Partial<ProfileService> = {
        getServerProfiles: jest.fn(() => {
        })
    };
    const mockKeyValueStore: Partial<KeyValueStore> = {
        getValue: jest.fn(() => {
        }),
        setValue: jest.fn(() => {
        })
    };
    const mockDbService: Partial<DbService> = {};
    const sharePreferencesMock: Partial<SharedPreferences> = {
        putString: jest.fn(() => {
        }),
        getString: jest.fn(() => {
        })
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => {
        })
    };
    const mockAppInfo: Partial<AppInfo> = {};

    beforeAll(() => {
        container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).to(CourseServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithCourseConfig as SdkConfig);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(sharePreferencesMock as SharedPreferences);
        container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).toConstantValue(mockAuthService as AuthService);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);

        courseService = container.get<CourseService>(InjectionTokens.COURSE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockClear();
        (ContentStatesSyncHandler as jest.Mock<ContentStatesSyncHandler>).mockClear();
    });

    it('should return instance from container', () => {
        expect(courseService).toBeTruthy();
    });

    it('should get batch details when invoked', (done) => {
        // arrange
        const request: CourseBatchDetailsRequest = {
            batchId: 'SAMPLE_BATCH_ID'
        };
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        courseService.getBatchDetails(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should updateContentState and store it in noSql', (done) => {
        // arrange
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
            return {
                manipulateEnrolledCoursesResponseLocally: jest.fn(() => of(true)),
                manipulateGetContentStateResponseLocally: jest.fn(() => of(true))
            };
        });
        const updateContentStateRequest: UpdateContentStateRequest = {
            userId: 'SAMPLE_USER_ID',
            courseId: 'SAMPLE_COURSE_ID',
            contentId: 'SAMPLE_CONTENT_ID',
            batchId: 'SAMPLE_BATCH_ID'
        };
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: 'SAMPLE_RESULT'
            }
        }));
        // act
        courseService.updateContentState(updateContentStateRequest).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

    it('should handler error scenarios when response return failed', (done) => {
        // arrange
        const updateContentStateRequest: UpdateContentStateRequest = {
            userId: 'SAMPLE_USER_ID',
            courseId: 'SAMPLE_COURSE_ID',
            contentId: 'SAMPLE_CONTENT_ID',
            batchId: 'SAMPLE_BATCH_ID'
        };
        spyOn(mockApiService, 'fetch').and.returnValue(of({response: {body: {result: 'FAILED'}}}));
        spyOn(mockKeyValueStore, 'getValue').and.returnValue(of('MOCK_KEY_VALUE'));
        spyOn(mockKeyValueStore, 'setValue').and.returnValue(of('MOCK_VALUE'));
        // act
        courseService.updateContentState(updateContentStateRequest).subscribe(() => {
            done();
        }, () => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should getCourseBatches for particular course when invoked', (done) => {
        // arrange
        const request: CourseBatchesRequest = {
            filters: {
                courseId: 'SAMPLE_COURSE_ID'
            },
            fields: ['SAMPLE_FIELDS']
        };

        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        spyOn(mockAuthService, 'getSession').and.returnValue(of(['SAMPLE_SESSION']));
        spyOn(mockProfileService, 'getServerProfiles').and.returnValue(of(['SAMPLE_PROFILE']));
        // act
        courseService.getCourseBatches(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockProfileService.getServerProfiles).toHaveBeenCalled();
            done();
        });
    });

    it('should unenroll course when method is Invoked', (done) => {
        // arrange
        const request: UnenrollCourseRequest = {
            userId: 'SAMPLE_USER ID',
            courseId: 'SAMPLE_COURSE_ID',
            batchId: 'BATCH_ID'
        };
        spyOn(courseService, 'getEnrolledCourses').and.returnValues(of(['SAMPLE']));
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        courseService.unenrollCourse(request).subscribe(() => {
            expect(courseService.getEnrolledCourses).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });

    describe('should call enrol courses and call refreshCourses', () => {
        it('should call getEnrolledCourse with returnFresh Course true', (done) => {
            // arrange
            const request: FetchEnrolledCourseRequest = {
                userId: 'SAMPLE_USER_ID',
                returnFreshCourses: true
            };
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE'
                    }
                }
            }));
            spyOn(mockKeyValueStore, 'getValue').and.returnValue(of('MOCK_VALUE'));
            (ContentStatesSyncHandler as jest.Mock<ContentStatesSyncHandler>).mockImplementation(() => {
                return {
                    updateContentState: jest.fn(() => of(true))
                };
            });
            mockDbService.execute = jest.fn(() => of([]));
            JSON.parse = jest.fn().mockImplementationOnce(() => {
                return request.userId;
            });
            // act
            courseService.getEnrolledCourses(request).subscribe(() => {
                // assert
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should enroll a course store it to noSql and update getEnrolledCourses', () => {
        // arrange
        const request: EnrollCourseRequest = {
            userId: 'SAMPLE_USER_ID',
            courseId: 'SAMPLE_COURSE_ID',
            batchId: 'SAMPLE_BATCH_ID'
        };
        spyOn(sharePreferencesMock, 'putString').and.returnValue(of({key: 'MOCK_COURSE_CONTEXT', value: 'MOCK_VALUE'}));
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SUCCESS'
                }
            }
        }));
        spyOn(courseService, 'getEnrolledCourses').and.returnValue(['MOCK_COURSES']);
        // act
        courseService.enrollCourse(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(sharePreferencesMock.putString).toHaveBeenCalled();
            expect(courseService.getEnrolledCourses).toHaveBeenCalled();
        });
        // assert
    });

    it('should call getContentState() when keyValue is not available', (done) => {
        // arrange
        const request: GetContentStateRequest = {
            userId: 'SAMPLE_USER_ID',
            batchId: 'SAMPLE_BATCH_ID',
            courseIds: ['SAMPLE_COURSE_ID'],
            contentIds: ['SAMPLE_CONTENT_ID'],
            returnRefreshedContentStates: false
        };
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
            return {
                getLocalContentStateResponse: jest.fn(() => of('MOCK_RESPONSE'))
            };
        });
        spyOn(mockApiService, 'fetch').and.returnValue(of({
            body: {
                result: {
                    response: 'SUCCESS'
                }
            }
        }));

        spyOn(mockKeyValueStore, 'getValue').and.returnValue(of(undefined));
        spyOn(mockKeyValueStore, 'setValue').and.returnValue(of('MOCK_RESPONSE'));
        // act
        courseService.getContentState(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();

            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });
});
