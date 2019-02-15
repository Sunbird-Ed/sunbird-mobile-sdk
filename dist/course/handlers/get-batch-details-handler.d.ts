import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
import { Batch, CourseBatchDetailsRequest, CourseServiceConfig } from '..';
export declare class GetBatchDetailsHandler implements ApiRequestHandler<CourseBatchDetailsRequest, Batch> {
    private apiService;
    private courseServiceConfig;
    readonly GET_BATCH_DETAILS_ENDPOINT: string;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(request: CourseBatchDetailsRequest): Observable<Batch>;
}
