import { Batch, ContentStateResponse, Course, CourseBatchDetailsRequest, CourseBatchesRequest, CourseService, DisplayDiscussionForumRequest, EnrollCourseRequest, FetchEnrolledCourseRequest, GenerateAttemptIdRequest, GetContentStateRequest, GetLearnerCerificateRequest, GetUserEnrolledCoursesRequest, UnenrollCourseRequest, UpdateContentStateRequest } from '..';
import { Observable } from 'rxjs';
import { ProfileService } from '../../profile';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { ApiRequestHandler, ApiService } from '../../api';
import { DbService } from '../../db';
import { SharedPreferences } from '../../util/shared-preferences';
import { Container } from 'inversify';
import { SdkConfig } from '../../sdk-config';
import { GetCertificateRequest } from '../def/get-certificate-request';
import { AppInfo } from '../../util/app';
import { DownloadCertificateResponse } from '../def/download-certificate-response';
import { FileService } from '../../util/file/def/file-service';
import { CsCourseService } from '@project-sunbird/client-services/services/course';
import { NetworkQueue } from '../../api/network-queue';
import { AuthService } from '../../auth';
import { LearnerCertificate } from '../def/get-learner-certificate-response';
import { GetEnrolledCourseResponse } from '../def/get-enrolled-course-response';
import { CourseCertificateManager } from '../def/course-certificate-manager';
import { UpdateContentStateResponse } from '../def/update-content-state-response';
import { UpdateCourseContentStateRequest } from '../def/update-course-content-state-request';
export declare class CourseServiceImpl implements CourseService {
    private sdkConfig;
    private apiService;
    private profileService;
    private keyValueStore;
    private dbService;
    private sharedPreferences;
    private appInfo;
    private fileService;
    private cachedItemStore;
    private csCourseService;
    private networkQueue;
    private container;
    private authService;
    private static readonly USER_ENROLLMENT_LIST_KEY_PREFIX;
    static readonly GET_CONTENT_STATE_KEY_PREFIX: string;
    static readonly GET_ENROLLED_COURSE_KEY_PREFIX: string;
    static readonly UPDATE_CONTENT_STATE_KEY_PREFIX: string;
    static readonly LAST_READ_CONTENTID_PREFIX: string;
    private static readonly CERTIFICATE_SIGN_ENDPOINT;
    private static readonly DISCUSSION_FORUM_ENDPOINT;
    private readonly courseServiceConfig;
    private readonly profileServiceConfig;
    private capturedAssessmentEvents;
    private syncAssessmentEventsHandler;
    private offlineAssessmentScoreProcessor;
    private _certificateManager?;
    readonly certificateManager: CourseCertificateManager;
    constructor(sdkConfig: SdkConfig, apiService: ApiService, profileService: ProfileService, keyValueStore: KeyValueStore, dbService: DbService, sharedPreferences: SharedPreferences, appInfo: AppInfo, fileService: FileService, cachedItemStore: CachedItemStore, csCourseService: CsCourseService, networkQueue: NetworkQueue, container: Container, authService: AuthService);
    static buildUrl(host: string, path: string, params: {
        [p: string]: string;
    }): string;
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;
    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;
    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;
    getEnrolledCourses(request: FetchEnrolledCourseRequest, apiHandler?: ApiRequestHandler<{
        userId: string;
    }, GetEnrolledCourseResponse>): Observable<Course[]>;
    getUserEnrolledCourses({ request, from }: GetUserEnrolledCoursesRequest): Observable<Course[]>;
    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;
    getContentState(request: GetContentStateRequest): Observable<ContentStateResponse | undefined>;
    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;
    downloadCurrentProfileCourseCertificate(request: GetCertificateRequest): Observable<DownloadCertificateResponse>;
    hasCapturedAssessmentEvent({ courseContext }: {
        courseContext: any;
    }): boolean;
    captureAssessmentEvent({ event, courseContext }: {
        event: any;
        courseContext: any;
    }): void;
    syncAssessmentEvents(options?: {
        persistedOnly: boolean;
    }): Observable<undefined>;
    resetCapturedAssessmentEvents(): void;
    generateAssessmentAttemptId(request: GenerateAttemptIdRequest): string;
    displayDiscussionForum(request: DisplayDiscussionForumRequest): Observable<boolean>;
    getLearnerCertificates(request: GetLearnerCerificateRequest): Observable<{
        count: number;
        content: LearnerCertificate[];
    }>;
    syncCourseProgress(request: UpdateCourseContentStateRequest): Observable<UpdateContentStateResponse>;
}
