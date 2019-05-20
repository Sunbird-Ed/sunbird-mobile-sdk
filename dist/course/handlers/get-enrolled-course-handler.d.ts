import { ApiRequestHandler, ApiService } from '../../api';
import { Course, CourseServiceConfig, FetchEnrolledCourseRequest } from '..';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {
    private keyValueStore;
    private apiService;
    private courseServiceConfig;
    private sharedPreference;
    private readonly GET_ENROLLED_COURSES_ENDPOINT;
    private readonly STORED_ENROLLED_COURSES_PREFIX;
    constructor(keyValueStore: KeyValueStore, apiService: ApiService, courseServiceConfig: CourseServiceConfig, sharedPreference: SharedPreferences);
    handle(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    private updateLastPlayedContent;
    private fetchFromServer;
}
