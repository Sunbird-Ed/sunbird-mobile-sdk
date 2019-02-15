import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    UpdateContentStateRequest
} from './request-types';
import {Observable} from 'rxjs';
import {Batch} from './batch';
import {Course} from './course';
import {UnenrollCourseRequest} from './unenrollCourseRequest';
// import {CourseContentStateRequest} from './course-content-state-request';
// import {CourseContentState} from './course-content-state';

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

    /**
     * This api is used to un-enroll the course.
     *
     * @param unenrollCourseRequest {@link UnenrollCourseRequest}
     * @return
     */
    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;

    /**
     * This api is used to get the state of content within a course for a particular batch
     *
     * @param contentStateRequest
     * @return
     */
    // getCourseContentState(contentStateRequest: CourseContentStateRequest): Observable<CourseContentState[]>;
}
