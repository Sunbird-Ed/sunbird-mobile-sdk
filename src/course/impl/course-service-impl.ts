import {
    Batch,
    ContentStateResponse,
    Course,
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    CourseServiceConfig,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest, GenerateAttemptIdRequest,
    GetContentStateRequest,
    UnenrollCourseRequest,
    UpdateContentStateRequest
} from '..';
import {Observable, Observer} from 'rxjs';
import {ProfileService, ProfileServiceConfig} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService, HttpRequestType, Request} from '../../api';
import {UnenrollCourseHandler} from '../handlers/unenroll-course-handler';
import {DbService} from '../../db';
import {ContentKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {GetContentStateHandler} from '../handlers/get-content-state-handler';
import {UpdateEnrolledCoursesHandler} from '../handlers/update-enrolled-courses-handler';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {CourseUtil} from '../course-util';
import {ContentStatesSyncHandler} from '../handlers/content-states-sync-handler';
import {ProcessingError} from '../../auth/errors/processing-error';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {DownloadCertificateRequest} from '../def/download-certificate-request';
import {AuthService} from '../../auth';
import {NoCertificateFound} from '../errors/no-certificate-found';
import {AppInfo} from '../../util/app';
import {FileUtil} from '../../util/file/util/file-util';
import {DownloadStatus} from '../../util/download';
import {DownloadCertificateResponse} from '../def/download-certificate-response';
import {SunbirdTelemetry} from '../../telemetry';
import * as MD5 from 'crypto-js/md5';
import {SyncAssessmentEventsHandler} from '../handlers/sync-assessment-events-handler';
import {ObjectUtil} from '../../util/object-util';

@injectable()
export class CourseServiceImpl implements CourseService {
    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo
    ) {
        this.courseServiceConfig = this.sdkConfig.courseServiceConfig;
        this.profileServiceConfig = this.sdkConfig.profileServiceConfig;

        this.syncAssessmentEventsHandler = new SyncAssessmentEventsHandler(
            this,
            this.sdkConfig,
            this.apiService,
            this.dbService
        );
    }

    public static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    public static readonly GET_ENROLLED_COURSE_KEY_PREFIX = 'enrolledCourses';
    public static readonly UPDATE_CONTENT_STATE_KEY_PREFIX = 'updateContentState';
    public static readonly LAST_READ_CONTENTID_PREFIX = 'lastReadContentId';

    private static readonly CERTIFICATE_SIGN_ENDPOINT = '/certs/download';

    private readonly courseServiceConfig: CourseServiceConfig;
    private readonly profileServiceConfig: ProfileServiceConfig;

    private capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined } = {};
    private syncAssessmentEventsHandler: SyncAssessmentEventsHandler;

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        const offlineContentStateHandler: OfflineContentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        return new UpdateContentStateApiHandler(this.apiService, this.courseServiceConfig)
            .handle(CourseUtil.getUpdateContentStateRequest(request)).map((response: { [key: string]: any }) => {
                if (response.hasOwnProperty(request.contentId) ||
                    response[request.contentId] !== 'FAILED') {
                    return true;
                }
                throw new ProcessingError('Request processing failed');
            })
            .catch((error) => {
                const key = CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX.concat(request.userId,
                    request.courseId, request.contentId, request.batchId);
                return this.keyValueStore.getValue(key).mergeMap((value: string | undefined) => {
                    return this.keyValueStore.setValue(key, JSON.stringify(request));
                });
            }).mergeMap(() => {
                return offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request);
            }).mergeMap(() => {
                return offlineContentStateHandler.manipulateGetContentStateResponseLocally(request);
            });
    }

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]> {
        return new GetCourseBatchesHandler(
            this.apiService, this.courseServiceConfig, this.profileService, this.authService)
            .handle(request);
    }

    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        const updateContentStateHandler: UpdateContentStateApiHandler =
            new UpdateContentStateApiHandler(this.apiService, this.courseServiceConfig);
        return Observable.zip(
            this.syncAssessmentEvents(),
            new ContentStatesSyncHandler(updateContentStateHandler, this.dbService, this.sharedPreferences, this.keyValueStore)
                .updateContentState()
        ).mergeMap(() => {
            return new GetEnrolledCourseHandler(
                this.keyValueStore, this.apiService, this.courseServiceConfig, this.sharedPreferences
            ).handle(request);
        });
    }

    enrollCourse(request: EnrollCourseRequest): Observable<boolean> {
        return new EnrollCourseHandler(this.apiService, this.courseServiceConfig)
            .handle(request).mergeMap(() => {
                const courseContext: { [key: string]: any } = {};
                courseContext['userId'] = request.userId;
                courseContext['batchStatus'] = request.batchStatus;
                return this.sharedPreferences.putString(ContentKeys.COURSE_CONTEXT, JSON.stringify(courseContext));
            }).delay(2000).concatMap(() => {
                return this.getEnrolledCourses({userId: request.userId, returnFreshCourses: true});
            }).mapTo(true);
    }

    getContentState(request: GetContentStateRequest): Observable<ContentStateResponse | undefined> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(request.userId, request.courseIds[0]);
        const offlinecontentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        const updateCourseHandler: UpdateEnrolledCoursesHandler =
            new UpdateEnrolledCoursesHandler(this.keyValueStore, offlinecontentStateHandler);
        return this.keyValueStore.getValue(key).mergeMap((value?: string) => {
            if (!value) {
                return new GetContentStateHandler(this.apiService, this.courseServiceConfig)
                    .handle(request).mergeMap((response: any) => {
                        if (response) {
                            return this.keyValueStore.setValue(key, JSON.stringify(response)).mergeMap(() => {
                                return offlinecontentStateHandler.getLocalContentStateResponse(request);
                            }).mergeMap(() => {
                                return updateCourseHandler.updateEnrollCourses(request);
                            });
                        } else {
                            return Observable.of<ContentStateResponse | undefined>(undefined);
                        }
                    }).catch((error) => {
                        return offlinecontentStateHandler.getLocalContentStateResponse(request).mergeMap(() => {
                            return updateCourseHandler.updateEnrollCourses(request);
                        });
                    });
            } else if (request.returnRefreshedContentStates) {
                return new GetContentStateHandler(this.apiService, this.courseServiceConfig)
                    .handle(request).mergeMap((response: any) => {
                        if (response) {
                            return this.keyValueStore.setValue(key, JSON.stringify(response)).mergeMap(() => {
                                return offlinecontentStateHandler.getLocalContentStateResponse(request);
                            }).mergeMap(() => {
                                return updateCourseHandler.updateEnrollCourses(request);
                            });
                        } else {
                            return Observable.of<ContentStateResponse | undefined>(undefined);
                        }
                    }).catch((error) => {
                        return offlinecontentStateHandler.getLocalContentStateResponse(request).mergeMap(() => {
                            return updateCourseHandler.updateEnrollCourses(request);
                        });
                    });
            } else {
                return offlinecontentStateHandler.getLocalContentStateResponse(request);
            }
        });
    }

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        return new UnenrollCourseHandler(this.apiService, this.courseServiceConfig).handle(unenrollCourseRequest)
            .delay(2000).concatMap(() => {
                return this.getEnrolledCourses({userId: unenrollCourseRequest.userId, returnFreshCourses: true});
            }).mapTo(true);
    }

    public downloadCurrentProfileCourseCertificate(request: DownloadCertificateRequest): Observable<DownloadCertificateResponse> {
        return this.profileService.getActiveProfileSession()
            .mergeMap((session) => {
                const option = {
                    userId: session.uid,
                    refreshEnrolledCourses: false,
                    returnRefreshedEnrolledCourses: true
                };
                return this.getEnrolledCourses(option);
            })
            .map((courses: Course[]) => {
                return courses
                    .filter((course) => course.status && course.status === 2)
                    .find((course) => course.courseId === request.courseId)!;
            })
            .map((course: Course) => {
                if (!course.certificates || !course.certificates.length ) {
                    throw new NoCertificateFound(`No certificate found for ${course.identifier}`);
                }

                const certificate = course.certificates[0];

                if (!certificate) {
                    throw new NoCertificateFound(`No certificate found for ${course.identifier}`);
                }

                return {certificate, course};
            })
            .mergeMap(({certificate, course}) => {
                const signCertificateRequest = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath(this.profileServiceConfig.profileApiPath + CourseServiceImpl.CERTIFICATE_SIGN_ENDPOINT)
                    .withApiToken(true)
                    .withSessionToken(true)
                    .withBody({
                        request:
                            {
                                pdfUrl: certificate.url
                            }
                    })
                    .build();

                return this.apiService.fetch<{ result: { signedUrl: string } }>(signCertificateRequest)
                    .map((response) => {
                        return {
                            certificate, course,
                            signedPdfUrl: response.body.result.signedUrl
                        };
                    });
            })
            .mergeMap(({certificate, course, signedPdfUrl}) => {
                const downloadRequest: EnqueueRequest = {
                    uri: signedPdfUrl,
                    title: certificate.token,
                    description: '',
                    mimeType: 'application/pdf',
                    visibleInDownloadsUi: true,
                    notificationVisibility: 1,
                    destinationInExternalFilesDir: {
                        dirType: 'Download',
                        subPath: `/${this.appInfo.getVersionName()}/${FileUtil.getFileName(certificate.url)}`
                    },
                    headers: []
                };

                return Observable.create((observer: Observer<string>) => {
                    downloadManager.enqueue(downloadRequest, (err, id: string) => {
                        if (err) {
                            return observer.error(err);
                        }

                        observer.next(id);
                    });
                }) as Observable<string>;
            }).mergeMap((downloadId: string) => {
                return Observable.interval(1000)
                    .mergeMap<number, EnqueuedEntry>(() => {
                        return Observable.create((observer: Observer<EnqueuedEntry>) => {
                            downloadManager.query({ids: [downloadId]}, (err, entries) => {
                                if (err) {
                                    return observer.error(err);
                                }

                                return observer.next(entries[0]! as EnqueuedEntry);
                            });
                        });
                    })
                    .filter((entry: EnqueuedEntry) => entry.status === DownloadStatus.STATUS_SUCCESSFUL)
                    .take(1);
            })
            .map((entry) => ({path: entry.localUri}));
    }

    public hasCapturedAssessmentEvent({courseContext}: { courseContext: any }) {
        const key = ObjectUtil.toOrderedString(courseContext);

        return !!this.capturedAssessmentEvents[key];
    }

    public captureAssessmentEvent({event, courseContext}) {
        const key = ObjectUtil.toOrderedString(courseContext);

        if (!this.capturedAssessmentEvents[key]) {
            this.capturedAssessmentEvents[key] = [];
        }

        this.capturedAssessmentEvents[key]!.push(event);
    }

    public syncAssessmentEvents(): Observable<undefined> {
        const capturedAssessmentEvents = this.capturedAssessmentEvents;

        this.resetCapturedAssessmentEvents();

        return this.syncAssessmentEventsHandler.handle(
            capturedAssessmentEvents
        );
    }

    public resetCapturedAssessmentEvents() {
        this.capturedAssessmentEvents = {};
    }

    generateAssessmentAttemptId(request: GenerateAttemptIdRequest): string {
        return MD5(
            [request.courseId, request.batchId, request.contentId, request.userId, Date.now()].join('-')
        ).toString();
    }
}
