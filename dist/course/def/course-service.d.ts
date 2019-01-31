import { CourseBatchDetailsRequest, CourseBatchesRequest, EnrollCourseRequest, FetchEnrolledCourseRequest, UpdateContentStateRequest } from './request-types';
import { Observable } from 'rxjs';
import { Batch } from './batch';
import { Course } from './course';
export interface CourseService {
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;
    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;
    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;
    /**
     * This api is used to get the enrolled course from cache if available or server.
     *
     * @param request {@link FetchEnrolledCourseRequest}
     * @return {}
     */
    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    /**
     * This api is used to enroll the course. The enrolled course is then cached.
     *
     * @param request {@link EnrollCourseRequest}
     * @return
     */
    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;
}
