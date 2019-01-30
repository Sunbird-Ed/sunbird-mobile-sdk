import { CourseService } from '../def/course-service';
import { Observable } from 'rxjs';
import { CourseBatchDetailsRequest, CourseBatchesRequest, EnrollCourseRequest, FetchEnrolledCourseRequest, UpdateContentStateRequest } from '../def/request-types';
import { Batch, Course, CourseServiceConfig } from '..';
import { SessionAuthenticator } from '../../auth';
import { ProfileService } from '../../profile';
import { KeyValueStore } from '../../key-value-store';
import { ApiService } from '../../api/def/api-service';
export declare class CourseServiceImpl implements CourseService {
    private courseServiceConfig;
    private apiService;
    private profileService;
    private keyValueStore;
    private sessionAuthenticator;
    constructor(courseServiceConfig: CourseServiceConfig, apiService: ApiService, profileService: ProfileService, keyValueStore: KeyValueStore, sessionAuthenticator: SessionAuthenticator);
    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch>;
    updateContentState(request: UpdateContentStateRequest): Observable<boolean>;
    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]>;
    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    enrollCourse(request: EnrollCourseRequest): Observable<boolean>;
}
