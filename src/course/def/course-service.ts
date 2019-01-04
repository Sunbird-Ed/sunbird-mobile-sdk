import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    UpdateContentStateRequest
} from './request-types';
import {Observable} from 'rxjs';

export interface CourseService {

    getEnrolledCourse(request: FetchEnrolledCourseRequest): Observable<any[]>;

    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;

    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;

    getCourseBatches(request: CourseBatchesRequest): Observable<any[]>;

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<any>;


}
