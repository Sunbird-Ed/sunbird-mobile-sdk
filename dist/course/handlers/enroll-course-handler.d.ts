import { ApiRequestHandler } from '../../api';
import { EnrollCourseRequest } from '../def/request-types';
import { Observable } from 'rxjs';
import { CourseServiceConfig } from '..';
import { SessionAuthenticator } from '../../auth';
import { ApiService } from '../../api/def/api-service';
export declare class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {
    private apiService;
    private courseServiceConfig;
    private sessionAuthenticator;
    private readonly ENROL_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: EnrollCourseRequest): Observable<boolean>;
}
