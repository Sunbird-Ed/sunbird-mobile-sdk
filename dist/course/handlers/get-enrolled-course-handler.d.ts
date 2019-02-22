import { ApiRequestHandler, ApiService } from '../../api';
import { Course, CourseServiceConfig, FetchEnrolledCourseRequest } from '..';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
export declare class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {
    private keyValueStore;
    private apiService;
    private courseServiceConfig;
    private readonly GET_ENROLLED_COURSES_ENDPOINT;
    private readonly STORED_ENROLLED_COURSES_PREFIX;
    constructor(keyValueStore: KeyValueStore, apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    private fetchFromServer;
}
