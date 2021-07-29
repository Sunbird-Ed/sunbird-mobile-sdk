import { ApiRequestHandler, ApiService } from '../../api';
import { CourseServiceConfig, EnrollCourseRequest } from '..';
import { Observable } from 'rxjs';
export declare class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {
    private apiService;
    private courseServiceConfig;
    private readonly ENROL_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(request: EnrollCourseRequest): Observable<boolean>;
}
