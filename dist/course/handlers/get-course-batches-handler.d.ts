import { ApiRequestHandler, ApiService } from '../../api';
import { Batch, CourseBatchesRequest, CourseServiceConfig } from '..';
import { Observable } from 'rxjs';
import { ProfileService } from '../../profile';
import { AuthService } from '../../auth';
export declare class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private apiService;
    private courseServiceConfig;
    private profileService;
    private authService;
    private readonly GET_COURSE_BATCHES;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, profileService: ProfileService, authService: AuthService);
    handle(request: CourseBatchesRequest): Observable<Batch[]>;
}
