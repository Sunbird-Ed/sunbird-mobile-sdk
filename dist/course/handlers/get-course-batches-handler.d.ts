import { ApiRequestHandler, ApiService } from '../../api';
import { Batch, CourseBatchesRequest, CourseServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private apiService;
    private courseServiceConfig;
    private readonly GET_COURSE_BATCHES;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(request: CourseBatchesRequest): Observable<Batch[]>;
}
