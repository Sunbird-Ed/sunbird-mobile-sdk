import { ApiRequestHandler, ApiService } from '../../api';
import { Course, CourseServiceConfig, FetchEnrolledCourseRequest } from '..';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
import { GetEnrolledCourseResponse } from '../def/get-enrolled-course-response';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {
    private keyValueStore;
    private apiService;
    private courseServiceConfig;
    private sharedPreference;
    private apiHandler?;
    private readonly GET_ENROLLED_COURSES_ENDPOINT;
    private readonly STORED_ENROLLED_COURSES_PREFIX;
    constructor(keyValueStore: KeyValueStore, apiService: ApiService, courseServiceConfig: CourseServiceConfig, sharedPreference: SharedPreferences, apiHandler?: ApiRequestHandler<{
        userId: string;
    }, GetEnrolledCourseResponse> | undefined);
    handle(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    private updateLastPlayedContent;
    private fetchFromServer;
}
