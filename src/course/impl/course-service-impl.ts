import {
    Batch,
    ContentStateResponse,
    Course,
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    CourseServiceConfig,
    DisplayDiscussionForumRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    GenerateAttemptIdRequest,
    GetContentStateRequest, GetLearnerCerificateRequest,
    GetUserEnrolledCoursesRequest,
    UnenrollCourseRequest,
    UpdateContentStateRequest,
    UpdateContentStateTarget
} from '..';
import {defer, interval, Observable, Observer, of} from 'rxjs';
import {ProfileService, ProfileServiceConfig} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {UnenrollCourseHandler} from '../handlers/unenroll-course-handler';
import {DbService} from '../../db';
import {ContentKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {GetContentStateHandler} from '../handlers/get-content-state-handler';
import {UpdateEnrolledCoursesHandler} from '../handlers/update-enrolled-courses-handler';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {CourseUtil} from '../course-util';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {GetCertificateRequest} from '../def/get-certificate-request';
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
import {AuthService} from '../../auth';
import * as qs from 'qs';
import {GetLearnerCertificateHandler} from '../handlers/get-learner-certificate-handler';
import {LearnerCertificate} from '../def/get-learner-certificate-response';
import {OfflineAssessmentScoreProcessor} from './offline-assessment-score-processor';
import {GetEnrolledCourseResponse} from '../def/get-enrolled-course-response';
import {CourseCertificateManager} from '../def/course-certificate-manager';
import {CourseCertificateManagerImpl} from './course-certificate-manager-impl';
import {UpdateContentStateResponse} from '../def/update-content-state-response';
import {UpdateCourseContentStateRequest} from '../def/update-course-content-state-request';
import { Browser } from '@capacitor/browser';

@injectable()
export class CourseServiceImpl implements CourseService {
    private static readonly USER_ENROLLMENT_LIST_KEY_PREFIX = 'userEnrollmentList';
    public static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    public static readonly GET_ENROLLED_COURSE_KEY_PREFIX = 'enrolledCourses';
    public static readonly UPDATE_CONTENT_STATE_KEY_PREFIX = 'updateContentState';
    public static readonly LAST_READ_CONTENTID_PREFIX = 'lastReadContentId';
    private static readonly CERTIFICATE_SIGN_ENDPOINT = '/api/certreg/v1/certs/download';
    private static readonly DISCUSSION_FORUM_ENDPOINT = '/discussions/auth/sunbird-oidc/callback';
    private readonly courseServiceConfig: CourseServiceConfig;
    private readonly profileServiceConfig: ProfileServiceConfig;
    private capturedAssessmentEvents: { [key: string]: SunbirdTelemetry.Telemetry[] | undefined } = {};
    private syncAssessmentEventsHandler: SyncAssessmentEventsHandler;
    private offlineAssessmentScoreProcessor: OfflineAssessmentScoreProcessor;

    private _certificateManager?: CourseCertificateManager;
    get certificateManager(): CourseCertificateManager {
        if (!this._certificateManager) {
            this._certificateManager = new CourseCertificateManagerImpl(
                this.profileService,
                this.fileService,
                this.keyValueStore,
                this.csCourseService
            );
        }
        return this._certificateManager;
    }

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
        @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService,
    ) {
        this.courseServiceConfig = this.sdkConfig.courseServiceConfig;
        this.profileServiceConfig = this.sdkConfig.profileServiceConfig;

        this.syncAssessmentEventsHandler = new SyncAssessmentEventsHandler(
            this,
            this.sdkConfig,
            this.dbService,
            this.networkQueue
        );
        this.offlineAssessmentScoreProcessor = new OfflineAssessmentScoreProcessor(
            this.keyValueStore, this.sharedPreferences
        );
    }

    static buildUrl(host: string, path: string, params: { [p: string]: string }) {
        return `${host}${path}?${qs.stringify(params)}`;
    }

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        if (!request.target) {
            request.target = [UpdateContentStateTarget.LOCAL, UpdateContentStateTarget.SERVER];
        }

        return defer(async () => {
            const offlineContentStateHandler: OfflineContentStateHandler = new OfflineContentStateHandler(this.keyValueStore);

            if (request.target!.indexOf(UpdateContentStateTarget.SERVER) > -1) {
                try {
                    await (new UpdateContentStateApiHandler(this.networkQueue, this.sdkConfig)
                        .handle(CourseUtil.getUpdateContentStateRequest(request))).toPromise();
                } catch (e) {
                }
            }

            if (request.target!.indexOf(UpdateContentStateTarget.LOCAL) > -1) {
                await offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request).toPromise();
                await offlineContentStateHandler.manipulateGetContentStateResponseLocally(request).toPromise();
            }

            return true;
        });
    }

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]> {
        return new GetCourseBatchesHandler(this.apiService, this.courseServiceConfig).handle(request);
    }

    getEnrolledCourses(
        request: FetchEnrolledCourseRequest,
        apiHandler?: ApiRequestHandler<{ userId: string }, GetEnrolledCourseResponse>
    ): Observable<Course[]> {
        return new GetEnrolledCourseHandler(
            this.keyValueStore, this.apiService, this.courseServiceConfig, this.sharedPreferences, apiHandler
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
                                mergeMap((response) => {
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

    public downloadCurrentProfileCourseCertificate(request: GetCertificateRequest): Observable<DownloadCertificateResponse> {
        return defer(async () => {
            const activeProfile = (await this.profileService.getActiveProfileSession().toPromise());
            const userId = activeProfile.managedSession ? activeProfile.managedSession.uid : activeProfile.uid;
            let devicePlatform = "";
            await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
                devicePlatform = val.platform
            })
            const folderPath = (devicePlatform.toLowerCase() === 'ios') ? cordova.file.documentsDirectory : cordova.file.externalRootDirectory;
            const filePath = `${folderPath}Download/${request.certificate.name}_${request.courseId}_${userId}.pdf`;
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
                                    if (err || (entries[0].status === DownloadStatus.STATUS_FAILED)) {
                                        return observer.error(err || new Error('Unknown Error'));
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
        (async () => {
            await this.offlineAssessmentScoreProcessor.process(capturedAssessmentEvents);
        })

        return this.syncAssessmentEventsHandler.handle(
            capturedAssessmentEvents
        );
    }

    public resetCapturedAssessmentEvents() {
        this.capturedAssessmentEvents = {};
    }

    generateAssessmentAttemptId(request: GenerateAttemptIdRequest): string {
        return MD5(
            [request.courseId, request.batchId, request.contentId,
                request.userId, request.date ? request.date : Date.now()].join('-')
        ).toString();
    }

    displayDiscussionForum(request: DisplayDiscussionForumRequest): Observable<boolean> {
        return defer(async () => {
            const session = await this.authService.getSession().toPromise();

            if (!session) {
                return false;
            }

            const accessToken = session.managed_access_token || session.access_token;

            Browser.open({url:
                CourseServiceImpl.buildUrl(this.sdkConfig.apiConfig.host, CourseServiceImpl.DISCUSSION_FORUM_ENDPOINT, {
                    'access_token': accessToken,
                    'returnTo': `/category/${request.forumId}`
                })}
            );

            return true;
        });
    }

    getLearnerCertificates(request: GetLearnerCerificateRequest): Observable<{ count: number, content: LearnerCertificate[] }> {
        return new GetLearnerCertificateHandler(this.apiService, this.cachedItemStore).handle(request);
    }

    syncCourseProgress(request: UpdateCourseContentStateRequest): Observable<UpdateContentStateResponse> {
        return this.csCourseService.updateContentState(request, {apiPath: '/api/course/v1'});
    }

    clearAssessments(): Observable<undefined> {
        return this.sharedPreferences.getString(ContentKeys.COURSE_CONTEXT).pipe(
            map((value) => {
                const result = value ? JSON.parse(value) : {};
                if (result) {
                    const key = ObjectUtil.toOrderedString(result);
                    if (this.capturedAssessmentEvents[key]) {
                        this.capturedAssessmentEvents[key] = [];
                    }

                }
                return undefined;
            })
        );
    }
}
