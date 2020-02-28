import { ContentStateResponse, CourseBatchDetailsRequest, CourseBatchesRequest, EnrollCourseRequest, FetchEnrolledCourseRequest, GenerateAttemptIdRequest, GetContentStateRequest, UpdateContentStateRequest } from './request-types';
import { Observable } from 'rxjs';
import { Batch } from './batch';
import { Course } from './course';
import { UnenrollCourseRequest } from './unenrollCourseRequest';
import { DownloadCertificateRequest } from './download-certificate-request';
import { DownloadCertificateResponse } from './download-certificate-response';
import { SunbirdTelemetry } from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;
export interface CourseService {
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;
    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;
    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;
    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;
    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;
    getContentState(contentStateRequest: GetContentStateRequest): Observable<ContentStateResponse | undefined>;
    downloadCurrentProfileCourseCertificate(downloadCertificateRequest: DownloadCertificateRequest): Observable<DownloadCertificateResponse>;
    /** @internal */
    hasCapturedAssessmentEvent(request: {
        courseContext: any;
    }): boolean;
    /** @internal */
    captureAssessmentEvent(capture: {
        event: Telemetry;
        courseContext: any;
    }): any;
    /** @internal */
    resetCapturedAssessmentEvents(): any;
    syncAssessmentEvents(options?: {
        persistedOnly: boolean;
    }): Observable<undefined>;
    generateAssessmentAttemptId(request: GenerateAttemptIdRequest): string;
}
