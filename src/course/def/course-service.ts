import {
    ContentStateResponse,
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    DisplayDiscussionForumRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    GenerateAttemptIdRequest,
    GetContentStateRequest, GetLearnerCerificateRequest,
    GetUserEnrolledCoursesRequest,
    UpdateContentStateRequest
} from './request-types';
import {Observable} from 'rxjs';
import {Batch} from './batch';
import {Course} from './course';
import {UnenrollCourseRequest} from './unenrollCourseRequest';
import {GetCertificateRequest} from './get-certificate-request';
import {DownloadCertificateResponse} from './download-certificate-response';
import {SunbirdTelemetry} from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;
import {LearnerCertificate} from './get-learner-certificate-response';
import {ApiRequestHandler} from '../../api';
import {GetEnrolledCourseResponse} from './get-enrolled-course-response';
import {CourseCertificateManager} from './course-certificate-manager';
import {UpdateContentStateResponse} from './update-content-state-response';
import {UpdateCourseContentStateRequest} from './update-course-content-state-request';

export interface CourseService {
    certificateManager: CourseCertificateManager;
    
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;

    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;

    getEnrolledCourses(
        request: FetchEnrolledCourseRequest,
        apiHandler?: ApiRequestHandler<{ userId: string }, GetEnrolledCourseResponse>
    ): Observable<Course[]>;

    getUserEnrolledCourses(request: GetUserEnrolledCoursesRequest): Observable<Course[]>;

    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;

    getContentState(contentStateRequest: GetContentStateRequest): Observable<ContentStateResponse | undefined>;

    downloadCurrentProfileCourseCertificate(
        downloadCertificateRequest: GetCertificateRequest
    ): Observable<DownloadCertificateResponse>;

    /** @internal */
    hasCapturedAssessmentEvent(request: {courseContext: any}): boolean;

    /** @internal */
    captureAssessmentEvent(capture: {event: Telemetry, courseContext: any});

    /** @internal */
    resetCapturedAssessmentEvents();

    syncAssessmentEvents(options?: { persistedOnly: boolean }): Observable<undefined>;

    generateAssessmentAttemptId(request: GenerateAttemptIdRequest): string;

    displayDiscussionForum(request: DisplayDiscussionForumRequest): Observable<boolean>;

    getLearnerCertificates(request: GetLearnerCerificateRequest): Observable<{count: number, content: LearnerCertificate[]}>;

    syncCourseProgress(request: UpdateCourseContentStateRequest): Observable<UpdateContentStateResponse>;

    clearAssessments(): Observable<undefined>;
}
