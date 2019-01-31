import { ApiRequestHandler } from '../../api';
import { FetchEnrolledCourseRequest } from '../def/request-types';
import { Course, CourseServiceConfig } from '..';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
import { SessionAuthenticator } from '../../auth';
import { ApiService } from '../../api/def/api-service';
export declare class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {
    private keyValueStore;
    private apiService;
    private courseServiceConfig;
    private sessionAuthenticator;
    private readonly GET_ENROLLED_COURSES_ENDPOINT;
    private readonly STORED_ENROLLED_COURSES_PREFIX;
    constructor(keyValueStore: KeyValueStore, apiService: ApiService, courseServiceConfig: CourseServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: FetchEnrolledCourseRequest): Observable<Course[]>;
    private fetchFromServer;
}
