import {
    Batch,
    CertificateAlreadyDownloaded,
    ContentStateResponse,
    Course,
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    CourseServiceConfig,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    GenerateAttemptIdRequest,
    GetContentStateRequest,
    GetUserEnrolledCoursesRequest,
    UnenrollCourseRequest,
    UpdateContentStateRequest
} from '..';
import {defer, interval, Observable, Observer, of} from 'rxjs';
import {ProfileService, ProfileServiceConfig} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ApiService, HttpRequestType, Request} from '../../api';
import {UnenrollCourseHandler} from '../handlers/unenroll-course-handler';
import {DbService} from '../../db';
import {ContentKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {GetContentStateHandler} from '../handlers/get-content-state-handler';
import {UpdateEnrolledCoursesHandler} from '../handlers/update-enrolled-courses-handler';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {CourseUtil} from '../course-util';
import {ProcessingError} from '../../auth/errors/processing-error';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {DownloadCertificateRequest} from '../def/download-certificate-request';
import {NoCertificateFound} from '../errors/no-certificate-found';
import {AppInfo} from '../../util/app';
import {DownloadStatus} from '../../util/download';
import {DownloadCertificateResponse} from '../def/download-certificate-response';
import {SunbirdTelemetry} from '../../telemetry';
import * as MD5 from 'crypto-js/md5';
import {SyncAssessmentEventsHandler} from '../handlers/sync-assessment-events-handler';
import {ObjectUtil} from '../../util/object-util';
import {catchError, concatMap, delay, filter, map, mapTo, mergeMap, take} from 'rxjs/operators';
import {FileService} from '../../util/file/def/file-service';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {NetworkQueue} from '../../api/network-queue';

@injectable()
export class CourseServiceImpl implements CourseService {
    private static readonly USER_ENROLLMENT_LIST_KEY_PREFIX = 'userEnrollmentList';
    public static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    public static readonly GET_ENROLLED_COURSE_KEY_PREFIX = 'enrolledCourses';
    public static readonly UPDATE_CONTENT_STATE_KEY_PREFIX = 'updateContentState';
    public static readonly LAST_READ_CONTENTID_PREFIX = 'lastReadContentId';
    private static readonly CERTIFICATE_SIGN_ENDPOINT = '/api/certreg/v1/certs/download';
    private readonly courseServiceConfig: CourseServiceConfig;
    private readonly profileServiceConfig: ProfileServiceConfig;
    private capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined } = {};
    private syncAssessmentEventsHandler: SyncAssessmentEventsHandler;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(CsInjectionTokens.COURSE_SERVICE) private csCourseService: CsCourseService,
        @inject(InjectionTokens.NETWORK_QUEUE) private networkQueue: NetworkQueue,
        @inject(InjectionTokens.CONTAINER) private container: Container,
    ) {
        this.courseServiceConfig = this.sdkConfig.courseServiceConfig;
        this.profileServiceConfig = this.sdkConfig.profileServiceConfig;

        this.syncAssessmentEventsHandler = new SyncAssessmentEventsHandler(
            this,
            this.sdkConfig,
            this.dbService,
            this.networkQueue
        );
    }

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        const offlineContentStateHandler: OfflineContentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        return new UpdateContentStateApiHandler(this.networkQueue, this.sdkConfig)
            .handle(CourseUtil.getUpdateContentStateRequest(request))
            .pipe(
                map((response: { [key: string]: any }) => {
                    if (response.hasOwnProperty(request.contentId) ||
                        response[request.contentId] !== 'FAILED') {
                        return true;
                    }
                    throw new ProcessingError('Request processing failed');
                }),
                catchError((error) => {
                    return of(true);
                }),
                mergeMap(() => {
                    return offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request);
                }),
                mergeMap(() => {
                    return offlineContentStateHandler.manipulateGetContentStateResponseLocally(request);
                })
            );
    }

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]> {
        return new GetCourseBatchesHandler(this.apiService, this.courseServiceConfig).handle(request);
    }

    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        return new GetEnrolledCourseHandler(
            this.keyValueStore, this.apiService, this.courseServiceConfig, this.sharedPreferences
        ).handle(request);
    }

    getUserEnrolledCourses({request, from}: GetUserEnrolledCoursesRequest): Observable<Course[]> {
        return this.cachedItemStore[from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            request.userId + (request.filters ? '_' + JSON.stringify(request.filters) : ''),
            CourseServiceImpl.USER_ENROLLMENT_LIST_KEY_PREFIX,
            'ttl_' + CourseServiceImpl.USER_ENROLLMENT_LIST_KEY_PREFIX,
            () => this.csCourseService.getUserEnrolledCourses(request, {}, {apiPath: '/api/course/v2', certRegistrationApiPath: ''}),
        );
    }

    enrollCourse(request: EnrollCourseRequest): Observable<boolean> {
        return new EnrollCourseHandler(this.apiService, this.courseServiceConfig)
            .handle(request)
            .pipe(
                mergeMap((isEnrolled) => {
                    if (isEnrolled) {
                        const courseContext: { [key: string]: any } = {};
                        courseContext['userId'] = request.userId;
                        courseContext['batchStatus'] = request.batchStatus;

                        return this.sharedPreferences.putString(ContentKeys.COURSE_CONTEXT, JSON.stringify(courseContext)).pipe(
                            delay(2000),
                            concatMap(() => {
                                return this.getEnrolledCourses({userId: request.userId, returnFreshCourses: true});
                            }),
                            mapTo(isEnrolled)
                        );
                    }

                    return of(isEnrolled);
                })
            );
    }

    getContentState(request: GetContentStateRequest): Observable<ContentStateResponse | undefined> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(request.userId, request.courseId);
        const offlinecontentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        const updateCourseHandler: UpdateEnrolledCoursesHandler =
            new UpdateEnrolledCoursesHandler(this.keyValueStore, offlinecontentStateHandler);
        return this.keyValueStore.getValue(key)
            .pipe(
                mergeMap((value?: string) => {
                    if (!value || request.returnRefreshedContentStates) {
                        return new GetContentStateHandler(
                            this.apiService,
                            this.courseServiceConfig,
                            this.container
                        ).handle(request)
                            .pipe(
                                mergeMap((response: any) => {
                                    if (response) {
                                        return this.keyValueStore.setValue(key, JSON.stringify(response))
                                            .pipe(
                                                mergeMap(() => {
                                                    return offlinecontentStateHandler.getLocalContentStateResponse(request);
                                                }),
                                                mergeMap(() => {
                                                    return updateCourseHandler.updateEnrollCourses(request);
                                                })
                                            );
                                    } else {
                                        return of<ContentStateResponse | undefined>(undefined);
                                    }
                                }),
                                catchError((error) => {
                                    return offlinecontentStateHandler.getLocalContentStateResponse(request)
                                        .pipe(
                                            mergeMap(() => {
                                                return updateCourseHandler.updateEnrollCourses(request);
                                            })
                                        );
                                })
                            );
                    } else {
                        return offlinecontentStateHandler.getLocalContentStateResponse(request);
                    }
                })
            );
    }

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        return new UnenrollCourseHandler(this.apiService, this.courseServiceConfig).handle(unenrollCourseRequest)
            .pipe(
                delay(2000),
                concatMap(() => {
                    return this.getEnrolledCourses({userId: unenrollCourseRequest.userId, returnFreshCourses: true});
                }),
                mapTo(true)
            );
    }

    public downloadCurrentProfileCourseCertificateV2(
        request: DownloadCertificateRequest,
        pdfDataProvider: (pdfSvgData: string, cb: (pdfData: Blob) => void) => void): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            const activeProfile = (await this.profileService.getActiveProfileSession().toPromise());
            const userId = activeProfile.managedSession ? activeProfile.managedSession.uid : activeProfile.uid;
            const filePath = `${cordova.file.externalRootDirectory}Download/${request.certificate.name}_${request.courseId}_${userId}.pdf`;
            try {
                await this.fileService.exists(filePath);
                throw new CertificateAlreadyDownloaded('Certificate already downloaded', filePath);
            } catch (e) {
                if (e instanceof CertificateAlreadyDownloaded) {
                    throw e;
                }
            }

            const response = await this.csCourseService.getSignedCourseCertificate(request.certificate.identifier!).toPromise();
            if (!response['printUri']) {
                throw new NoCertificateFound(`No certificate found for ${request.courseId}`);
            }
            return new Promise<{ path: string }>((resolve, reject) => {
                pdfDataProvider(response['printUri'], (pdfData: Blob) => {
                    try {
                        this.fileService.writeFile(cordova.file.externalRootDirectory +
                            'Download/', `${request.certificate.name}_${request.courseId}_${userId}.pdf`, pdfData as any, {replace: true});
                        resolve({
                            path: `${cordova.file.externalRootDirectory}Download/${request.certificate.name}_${request.courseId}_${userId}.pdf`
                        });
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }

    public downloadCurrentProfileCourseCertificate(request: DownloadCertificateRequest): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            const activeProfile = (await this.profileService.getActiveProfileSession().toPromise());
            const userId = activeProfile.managedSession ? activeProfile.managedSession.uid : activeProfile.uid;
            const filePath = `${cordova.file.externalRootDirectory}Download/${request.certificate.name}_${request.courseId}_${userId}.pdf`;
            try {
                await this.fileService.exists(filePath);
                throw new CertificateAlreadyDownloaded('Certificate already downloaded', filePath);
            } catch (e) {
                if (e instanceof CertificateAlreadyDownloaded) {
                    throw e;
                }
            }

            return {userId};
        }).pipe(
            mergeMap(({userId}) => {
                const signCertificateRequest = new Request.Builder()
                    .withType(HttpRequestType.POST)
                    .withPath(CourseServiceImpl.CERTIFICATE_SIGN_ENDPOINT)
                    .withBearerToken(true)
                    .withUserToken(true)
                    .withBody({
                        request:
                            {
                                pdfUrl: request.certificate.url!
                            }
                    })
                    .build();

                return this.apiService.fetch<{ result: { signedUrl: string } }>(signCertificateRequest)
                    .pipe(
                        map((response) => {
                            return {
                                signedPdfUrl: response.body.result.signedUrl,
                                userId
                            };
                        })
                    );
            }),
            mergeMap(({signedPdfUrl, userId}) => {
                const downloadRequest: EnqueueRequest = {
                    uri: signedPdfUrl,
                    title: request.certificate.token,
                    description: '',
                    mimeType: 'application/pdf',
                    visibleInDownloadsUi: true,
                    notificationVisibility: 1,
                    destinationInExternalPublicDir: {
                        dirType: 'Download',
                        subPath: `/${request.certificate.name}_${request.courseId}_${userId}.pdf`
                    },
                    headers: []
                };

                return new Observable<string>((observer: Observer<string>) => {
                    downloadManager.enqueue(downloadRequest, (err, id: string) => {
                        if (err) {
                            return observer.error(err);
                        }

                        observer.next(id);
                        observer.complete();
                    });
                }) as Observable<string>;
            }),
            mergeMap((downloadId: string) => {
                return interval(1000)
                    .pipe(
                        mergeMap(() => {
                            return new Observable((observer: Observer<EnqueuedEntry>) => {
                                downloadManager.query({ids: [downloadId]}, (err, entries) => {
                                    if (err) {
                                        return observer.error(err);
                                    }

                                    return observer.next(entries[0]! as EnqueuedEntry);
                                });
                            });
                        }),
                        filter((entry: EnqueuedEntry) => entry.status === DownloadStatus.STATUS_SUCCESSFUL),
                        take(1)
                    );
            }),
            map((entry) => ({path: entry.localUri}))
        );
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

    public syncAssessmentEvents(options = {persistedOnly: false}): Observable<undefined> {
        let capturedAssessmentEvents = {};

        if (!options.persistedOnly) {
            capturedAssessmentEvents = this.capturedAssessmentEvents;

            this.resetCapturedAssessmentEvents();
        }

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
