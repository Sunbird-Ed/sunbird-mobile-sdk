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
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {mockSdkConfigWithCourseConfig} from './course-service-impl.spec.data';
import {ApiService} from '../../api';
import {ProfileService} from '../../profile';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {DbService} from '../../db';
import {SharedPreferences} from '../../util/shared-preferences';
import {AuthService} from '../../auth';
import {of, throwError} from 'rxjs';
import {AppInfo} from '../../util/app';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {SyncAssessmentEventsHandler} from '../handlers/sync-assessment-events-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {FileService} from '../../util/file/def/file-service';
import {NetworkQueue} from '../../api/network-queue';
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';
import {DownloadCertificateRequest} from '../def/download-certificate-request';
import {NoCertificateFound} from '../errors/no-certificate-found';
import {CertificateAlreadyDownloaded} from '../errors/certificate-already-downloaded';
import {ContentService, DownloadStatus, GenerateAttemptIdRequest} from '../..';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {GetContentStateHandler} from '../handlers/get-content-state-handler';

jest.mock('../handlers/offline-content-state-handler');
jest.mock('../handlers/sync-assessment-events-handler');
jest.mock('../handlers/get-enrolled-course-handler');
jest.mock('../errors/no-certificate-found');
jest.mock('../errors/certificate-already-downloaded');
jest.mock('../handlers/update-content-state-api-handler');
jest.mock('../handlers/enroll-course-handler');
jest.mock('../handlers/get-content-state-handler');

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
        exists: jest.fn().mockImplementation(() => {
        }),
        getTempLocation: jest.fn().mockImplementation(() => {
        })
    };
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockCsCourseService: Partial<CsCourseService> = {};
    const mockContentService: Partial<ContentService> = {};

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
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<CsCourseService>(CsInjectionTokens.COURSE_SERVICE).toConstantValue(mockCsCourseService as CsCourseService);
        container.bind<NetworkQueue>(InjectionTokens.NETWORK_QUEUE).toConstantValue(mockNetworkQueue as NetworkQueue);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);

        (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockImplementation(() => {
            return mockSyncAssessmentEventsHandler as Partial<SyncAssessmentEventsHandler> as SyncAssessmentEventsHandler;
        });

        courseService = container.get<CourseService>(InjectionTokens.COURSE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockClear();
        (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockClear();
        (NoCertificateFound as any as jest.Mock<NoCertificateFound>).mockClear();
        (CertificateAlreadyDownloaded as any as jest.Mock<CertificateAlreadyDownloaded>).mockClear();
        (UpdateContentStateApiHandler as any as jest.Mock<UpdateContentStateApiHandler>).mockClear();
        (EnrollCourseHandler as jest.Mock<EnrollCourseHandler>).mockClear();
        (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockClear();
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

   describe('updateContentState', () => {
    it('should updateContentState and store it in noSql', (done) => {
        // arrange
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
            return {
                manipulateEnrolledCoursesResponseLocally: jest.fn().mockImplementation(() => of(true)),
                manipulateGetContentStateResponseLocally: jest.fn().mockImplementation(() => of(true))
            } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
        });

        (UpdateContentStateApiHandler as any as jest.Mock<UpdateContentStateApiHandler>).mockImplementation(() => {
            return {
                handle: jest.fn(() => of({'SAMPLE_CONTENT_ID': 'content-id'}))
            } as Partial<UpdateContentStateApiHandler> as UpdateContentStateApiHandler;
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
            done();
        });
    });

    it('should handler error scenarios when response return failed', (done) => {
        // arrange
        (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
            return {
                manipulateEnrolledCoursesResponseLocally: jest.fn().mockImplementation(() => of(true)),
                manipulateGetContentStateResponseLocally: jest.fn().mockImplementation(() => of(true))
            } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
        });

        (UpdateContentStateApiHandler as any as jest.Mock<UpdateContentStateApiHandler>).mockImplementation(() => {
            return {
                handle: jest.fn(() => of({}))
            } as Partial<UpdateContentStateApiHandler> as UpdateContentStateApiHandler;
        });
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
            // expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
        // assert
    });
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

    it('should enroll a course store it to noSql and update getEnrolledCourses', (done) => {
        // arrange
        const request: EnrollCourseRequest = {
            userId: 'SAMPLE_USER_ID',
            courseId: 'SAMPLE_COURSE_ID',
            batchId: 'SAMPLE_BATCH_ID'
        };
        sharePreferencesMock.putString = jest.fn(() => of(undefined));
        (EnrollCourseHandler as any as jest.Mock<EnrollCourseHandler>).mockImplementation(() => {
            return {
                handle: jest.fn(() => of(true))
            } as Partial<EnrollCourseHandler> as EnrollCourseHandler;
        });
        jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
            return of([{id: 'do-123'}]);
        });
        // act
        courseService.enrollCourse(request).subscribe(() => {
            expect(sharePreferencesMock.putString).toHaveBeenCalled();
            expect(courseService.getEnrolledCourses).toHaveBeenCalled();
            done();
        });
        // assert
    });

    describe('getContentState', () => {
        it('should call getContentState() when keyValue is not available', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: false
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(undefined));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of('{"id": "do-123"}'))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            mockKeyValueStore.setValue = jest.fn(() => of(true));
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                expect(mockKeyValueStore.setValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is not available andnGetContentStateHandler response is undefined', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: false
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(undefined));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of(undefined))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is not available for GetContentStateHandler error part', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: false
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(undefined));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => throwError({error: 'error'}))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is available', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: true
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(JSON.stringify({result: {courses: [{courseId: 'Course-Id'}]}})));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of('{"id": "do-123"}'))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            mockKeyValueStore.setValue = jest.fn(() => of(true));
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                expect(mockKeyValueStore.setValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is available and GetContentStateHandler response is undefined', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: true
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of('{"courseId": "do-123"}'));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of(undefined))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is available for catch part', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: true
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn(() => of({contentList: [{
                        status: 2,
                        contentId: 'content-id'
                    }]}))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(JSON.stringify({result: {courses: [{courseId: 'Course-Id',
            contentId: 'content-id'}]}})));
            (GetContentStateHandler as jest.Mock<GetContentStateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => throwError({error: 'error'}))
                } as Partial<GetContentStateHandler> as GetContentStateHandler;
            });
            mockKeyValueStore.setValue = jest.fn(() => of(true));
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                expect(mockKeyValueStore.setValue).toHaveBeenCalled();
                done();
            });
        });

        it('should call getContentState() when keyValue is available for last else part', (done) => {
            // arrange
            const request: GetContentStateRequest = {
                userId: 'SAMPLE_USER_ID',
                batchId: 'SAMPLE_BATCH_ID',
                courseId: 'SAMPLE_COURSE_ID',
                contentIds: ['SAMPLE_CONTENT_ID'],
                returnRefreshedContentStates: false
            };
            (OfflineContentStateHandler as jest.Mock<OfflineContentStateHandler>).mockImplementation(() => {
                return {
                    getLocalContentStateResponse: jest.fn().mockImplementation(() => of('MOCK_RESPONSE'))
                } as Partial<OfflineContentStateHandler> as OfflineContentStateHandler;
            });
            mockKeyValueStore.getValue = jest.fn(() => of(JSON.stringify({result: {courses: [{courseId: 'Course-Id'}]}})));
            // act
            courseService.getContentState(request).subscribe(() => {
                // assert
                expect(mockKeyValueStore.getValue).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('getUserEnrollmentList', () => {
        it('should delegate to cached CsCourseService defaulting to from.Cache', (done) => {
            mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of([]));

            courseService.getUserEnrolledCourses({request: {userId: 'some_user_id'}}).subscribe(() => {
                expect(mockCachedItemStore.getCached).toHaveBeenCalled();
                done();
            }, fail);
        });

        it('should delegate to cached CsCourseService', (done) => {
            mockCachedItemStore.get = jest.fn().mockImplementation(() => of([]));

            courseService.getUserEnrolledCourses({
                from: CachedItemRequestSourceFrom.SERVER,
                request: {userId: 'some_user_id'}
            }).subscribe(() => {
                expect(mockCachedItemStore.get).toHaveBeenCalled();
                done();
            }, fail);
        });
    });

    describe('downloadCurrentProfileCourseCertificate', () => {
        it('should return course which does not have certificate', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: []
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: []
                }]) as any;
            });

            (NoCertificateFound as any as jest.Mock<NoCertificateFound>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({error: 'error'}))
                } as Partial<NoCertificateFound> as NoCertificateFound;
            });
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });

        it('should return DownloadCertificateResponse if certificate ont found', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: [undefined]
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: [undefined]
                }]) as any;
            });

            (NoCertificateFound as any as jest.Mock<NoCertificateFound>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({error: 'error'}))
                } as Partial<NoCertificateFound> as NoCertificateFound;
            });
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });

        it('should return DownloadCertificateResponse if certificate already downloaded', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: [{
                        name: 'sample-cer-1',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url/',
                        token: 'sample-token',
                        id: 'sample-id'
                    }]
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: [{
                        name: 'sample-cer-2',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url-2/',
                        token: 'sample-token',
                        id: 'sample-id-1'
                    }]
                }]) as any;
            });
            mockFileService.exists = jest.fn(() => Promise.resolve({})) as any;
            (CertificateAlreadyDownloaded as any as jest.Mock<CertificateAlreadyDownloaded>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({error: 'error'}))
                } as Partial<CertificateAlreadyDownloaded> as CertificateAlreadyDownloaded;
            });
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockFileService.exists).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });

        it('should return DownloadCertificateResponse if certificate already downloaded for catch part and enqueue is error', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: [{
                        name: 'sample-cer-1',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url/',
                        token: 'sample-token',
                        id: 'sample-id'
                    }]
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: [{
                        name: 'sample-cer-2',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url-2/',
                        token: 'sample-token',
                        id: 'sample-id-1'
                    }]
                }]) as any;
            });
            mockFileService.exists = jest.fn(() => Promise.reject({})) as any;
            (CertificateAlreadyDownloaded as any as jest.Mock<CertificateAlreadyDownloaded>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({code: 'error'})) as any
                } as Partial<CertificateAlreadyDownloaded> as CertificateAlreadyDownloaded;
            });
            mockApiService.fetch = jest.fn(() => of({
                body: {
                    result: {
                        signedUrl: 'http://signed-url'
                    }
                }
            })) as any;
            window['downloadManager'] = {
                enqueue: jest.fn(({}, fn) => fn({err: 'error'}))
            };
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });

        it('should return DownloadCertificateResponse if certificate already downloaded for catch part enqueue is downloadId', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: [{
                        name: 'sample-cer-1',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url/',
                        token: 'sample-token',
                        id: 'sample-id'
                    }]
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: [{
                        name: 'sample-cer-2',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url-2/',
                        token: 'sample-token',
                        id: 'sample-id-1'
                    }]
                }]) as any;
            });
            mockFileService.exists = jest.fn(() => Promise.reject({})) as any;
            (CertificateAlreadyDownloaded as any as jest.Mock<CertificateAlreadyDownloaded>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({code: 'error'})) as any
                } as Partial<CertificateAlreadyDownloaded> as CertificateAlreadyDownloaded;
            });
            mockApiService.fetch = jest.fn(() => of({
                body: {
                    result: {
                        signedUrl: 'http://signed-url'
                    }
                }
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({}, fn) => fn(data, {id: 'sample-id'})),
                query: jest.fn((_, fn) => fn({err: 'error'}))
            };
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });

        it('should return DownloadCertificateResponse if certificate already downloaded for catch partand quary is entries', (done) => {
            const request: DownloadCertificateRequest = {
                courseId: 'sample-course-id',
                certificateToken: 'sample-certicate-token'
            };
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample-uid',
                sid: 'sample-sid',
                createdTime: Date.now()
            }));
            jest.spyOn(courseService, 'getEnrolledCourses').mockImplementation(() => {
                return of([{
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-123',
                    certificates: [{
                        name: 'sample-cer-1',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url/',
                        token: 'sample-token',
                        id: 'sample-id'
                    }]
                }, {
                    status: 2,
                    courseId: 'sample-course-id',
                    identifier: 'do-234',
                    certificates: [{
                        name: 'sample-cer-2',
                        lastIssuedOn: '17/07/2020',
                        url: 'http://sample-url-2/',
                        token: 'sample-token',
                        id: 'sample-id-1'
                    }]
                }]) as any;
            });
            mockFileService.exists = jest.fn(() => Promise.reject({})) as any;
            (CertificateAlreadyDownloaded as any as jest.Mock<CertificateAlreadyDownloaded>).mockImplementation(() => {
                return {
                    super: jest.fn(() => ({code: 'error'})) as any
                } as Partial<CertificateAlreadyDownloaded> as CertificateAlreadyDownloaded;
            });
            mockApiService.fetch = jest.fn(() => of({
                body: {
                    result: {
                        signedUrl: 'http://signed-url'
                    }
                }
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({}, fn) => fn(data, {id: 'sample-id'})),
                query: jest.fn((_, fn) => fn(data, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'sample-local-uri'
                }]))
            };
            // act
            courseService.downloadCurrentProfileCourseCertificate(request).subscribe(() => {
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                done();
            }, (e) => {
                done();
            });
        });
    });

    describe('syncAssessmentEvents()', () => {
        it('should default to persistedOnly false option', (done) => {
            // arrange
            const options = {persistedOnly: false};
            jest.spyOn(courseService, 'resetCapturedAssessmentEvents').mockImplementation();
            (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of(undefined))
                } as Partial<SyncAssessmentEventsHandler> as SyncAssessmentEventsHandler;
            });

            // act
            courseService.syncAssessmentEvents(options);
            setTimeout(() => {
                expect(courseService.resetCapturedAssessmentEvents).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should not sync captured assessment when persistedOnly option is true', (done) => {
            // arrange
            const options = {persistedOnly: true};
            const handleFn = jest.fn(() => of(undefined));
            (SyncAssessmentEventsHandler as any as jest.Mock<SyncAssessmentEventsHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn(() => of(undefined))
                } as Partial<SyncAssessmentEventsHandler> as SyncAssessmentEventsHandler;
            });

            // act
            courseService.syncAssessmentEvents(options);
            setTimeout(() => {
                expect(options.persistedOnly).toBeTruthy();
                done();
            }, 0);
        });
    });

    describe('hasCapturedAssessmentEvent', () => {
        it('should return CapturedAssessmentEvent', () => {
            const courseContext = {id: 'sample-id'};
            courseService.hasCapturedAssessmentEvent({courseContext});
        });
    });

    describe('captureAssessmentEvent', () => {
        it('should return captureAssessmentEvent', () => {
            const event = {eventName: 'sample-event'};
            const courseContext = {id: 'sample-id'};
            // act
            courseService.captureAssessmentEvent({event, courseContext} as any);
        });
    });

    it('should return resetCapturedAssessmentEvents', () => {
        courseService.resetCapturedAssessmentEvents();
    });

    it('should return generateAssessmentAttemptId', () => {
        const request: GenerateAttemptIdRequest = {
            courseId: 'sample-course-id',
            batchId: 'sample-batch-id',
            contentId: 'sample-content-id',
            userId: 'sample-user-id'
        };
        courseService.generateAssessmentAttemptId(request);
    });
});
