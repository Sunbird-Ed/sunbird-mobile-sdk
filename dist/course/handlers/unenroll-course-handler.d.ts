import { ApiRequestHandler, ApiService } from '../../api';
import { CourseServiceConfig, UnenrollCourseRequest } from '..';
import { Observable } from 'rxjs';
export declare class UnenrollCourseHandler implements ApiRequestHandler<UnenrollCourseRequest, boolean> {
    private apiService;
    private unenrollCourseServiceApiConfig;
    private readonly GET_UNENROLL_COURSE_ENDPOINT;
    constructor(apiService: ApiService, unenrollCourseServiceApiConfig: CourseServiceConfig);
    handle(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean>;
}
