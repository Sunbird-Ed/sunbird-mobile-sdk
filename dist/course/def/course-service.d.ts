import { CourseBatchDetailsRequest, CourseBatchesRequest, EnrollCourseRequest, FetchEnrolledCourseRequest, UpdateContentStateRequest } from './request-types';
import { Observable } from 'rxjs';
import { Batch } from './batch';
import { Course } from './course';
import { UnenrollCourseRequest } from './unenrollCourseRequest';
export interface CourseService {
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;
    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;
    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;
    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;
    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;
}
