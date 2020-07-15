import {CourseServiceImpl} from './course-service-impl';
import {Container} from 'inversify';
import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    EnrollCourseRequest,
    GetContentStateRequest,
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
import {SyncAssessmentEventsHandler} from '../handlers/sync-assessment-events-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import { FileService } from '../../util/file/def/file-service';
import {NetworkQueue} from '../../api/network-queue';
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';

jest.mock('../handlers/offline-content-state-handler');
jest.mock('../handlers/content-states-sync-handler');
jest.mock('../handlers/sync-assessment-events-handler');
jest.mock('../handlers/get-enrolled-course-handler');

describe('CourseServiceImpl', () => {
    let courseService: CourseService;

    const container = new Container();

    const mockApiService: Partial<ApiService> = {
        fetch: jest.fn().mockImplementation(() => {
        })
    };
    const mockProfileService: Partial<ProfileService> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {
        getValue: jest.fn().mockImplementation(() => {
        }),
        setValue: jest.fn().mockImplementation(() => {
        })
    };
    const mockDbService: Partial<DbService> = {};
    const sharePreferencesMock: Partial<SharedPreferences> = {
        putString: jest.fn().mockImplementation(() => {
        }),
        getString: jest.fn().mockImplementation(() => {
        })
    };
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn().mockImplementation(() => {
        })
    };
    const mockAppInfo: Partial<AppInfo> = {};
    const mockSyncAssessmentEventsHandler = {
        handle: jest.fn().mockImplementation(() => of(undefined))
    };
    const mockFileService: Partial<FileService> = {
        exists: jest.fn().mockImplementation(() => { }),
        getTempLocation: jest.fn().mockImplementation(() => { })
    };

    const mockNetworkQueue: Partial<NetworkQueue> = {
        enqueue: jest.fn(() => of({} as any))
    };
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
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<NetworkQueue>(InjectionTokens.NETWORK_QUEUE).toConstantValue(mockNetworkQueue as NetworkQueue);

        (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockImplementation(() => {
            return mockSyncAssessmentEventsHandler as Partial<SyncAssessmentEventsHandler> as SyncAssessmentEventsHandler;
        });

        courseService = container.get<CourseService>(InjectionTokens.COURSE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockClear();
        (ContentStatesSyncHandler as jest.Mock<ContentStatesSyncHandler>).mockClear();
        (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockClear();
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
                manipulateEnrolledCoursesResponseLocally: jest.fn().mockImplementation(() => of(true)),
                manipulateGetContentStateResponseLocally: jest.fn().mockImplementation(() => of(true))
            } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
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
        spyOn(mockKeyValueStore, 'getValue').and.returnValue(of('MOCK_KEY_VALUE'));
        spyOn(mockKeyValueStore, 'setValue').and.returnValue(of('MOCK_VALUE'));
        // act
        courseService.updateContentState(updateContentStateRequest).subscribe(() => {
            // assert
            expect(mockNetworkQueue.enqueue).toHaveBeenCalled();
            done();
        });
    });

    it('should handler error scenarios when response return failed', (done) => {
        // arrange
        const updateContentStateRequest: UpdateContentStateRequest = {
            userId: 'SAMPLE_USER_ID',
            courseId: 'SAMPLE_COURSE_ID',
            contentId: 'SAMPLE_CONTENT_ID',
            batchId: 'SAMPLE_BATCH_ID',
            result: 'SOME_RESULT',
            grade: 'SOME_GRADE',
            score: 'SOME_SCORE'
        };
        spyOn(mockApiService, 'fetch').and.returnValue(of({response: {body: {result: 'FAILED'}}}));
        spyOn(mockKeyValueStore, 'getValue').and.returnValue(of('MOCK_KEY_VALUE'));
        spyOn(mockKeyValueStore, 'setValue').and.returnValue(of('MOCK_VALUE'));
        // act
        courseService.updateContentState(updateContentStateRequest).subscribe(() => {
            done();
        }, () => {
            expect(mockNetworkQueue.enqueue).toHaveBeenCalled();
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
        // act
        courseService.getCourseBatches(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
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

    describe('getEnrolledCourse()', () => {
        let mockGetEnrolledCourseHandler = {
            handle: jest.fn().mockImplementation(() => of([]))
        };

        beforeEach(() => {
            // arrange
            spyOn(courseService, 'syncAssessmentEvents').and.returnValue(of(undefined));
            (ContentStatesSyncHandler as jest.Mock<ContentStatesSyncHandler>).mockImplementation(() => {
                return {
                    updateContentState: jest.fn().mockImplementation(() => of(true))
                } as Partial<ContentStatesSyncHandler> as ContentStatesSyncHandler;
            });
            mockGetEnrolledCourseHandler = {
                handle: jest.fn().mockImplementation(() => of([]))
            };
            (GetEnrolledCourseHandler as jest.Mock<GetEnrolledCourseHandler>).mockImplementation(() => {
                return mockGetEnrolledCourseHandler as Partial<GetEnrolledCourseHandler> as GetEnrolledCourseHandler;
            });
        });

        it('should delegate to GetEnrolledCourseHandler', (done) => {
            const request = {
                userId: 'SAMPLE_USER_ID',
                returnFreshCourses: true
            };
            // act
            courseService.getEnrolledCourses(request).subscribe(() => {
                // assert
                expect(mockGetEnrolledCourseHandler.handle).toHaveBeenCalledWith(request);
                done();
            });
        });

        it('should sync persisted assessment events', (done) => {
            const request = {
                userId: 'SAMPLE_USER_ID',
                returnFreshCourses: true
            };
            // act
            courseService.getEnrolledCourses(request).subscribe(() => {
                // assert
                expect(courseService.syncAssessmentEvents).not.toHaveBeenCalledWith({
                    persistedOnly: true
                });
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
                getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
            } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
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

    describe('syncAssessmentEvents()', () => {
        it('should default to persistedOnly false option', (done) => {
            // arrange
            courseService['capturedAssessmentEvents']['SAMPLE_KEY'] = [{}, {}, {}];
            spyOn(courseService, 'resetCapturedAssessmentEvents').and.stub();

            // act
            courseService.syncAssessmentEvents().subscribe(() => {
                // assert
                expect(mockSyncAssessmentEventsHandler.handle).toHaveBeenCalledWith(
                    expect.objectContaining({'SAMPLE_KEY': expect.any(Array)})
                );
                expect(courseService.resetCapturedAssessmentEvents).toHaveBeenCalled();
                done();
            });
        });

        it('should not sync captured assessment when persistedOnly option is true', (done) => {
            // arrange
            courseService['capturedAssessmentEvents']['SAMPLE_KEY'] = [{}, {}, {}];
            spyOn(courseService, 'resetCapturedAssessmentEvents').and.stub();

            // act
            courseService.syncAssessmentEvents({persistedOnly: true}).subscribe(() => {
                // assert
                expect(mockSyncAssessmentEventsHandler.handle).toHaveBeenCalledWith(expect.objectContaining({}));
                expect(courseService.resetCapturedAssessmentEvents).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
