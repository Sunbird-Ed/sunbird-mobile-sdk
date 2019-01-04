import {FetchEnrolledCourseRequest} from './request-types';
import {Observable} from '../../async';

export interface CourseService {

    getEnrolledCourse(request: FetchEnrolledCourseRequest): Observable<any[]>;


}
