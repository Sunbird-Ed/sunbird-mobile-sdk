import { ApiRequestHandler } from '../../api';
import { Observable } from 'rxjs';
import { Batch, CourseServiceConfig } from '..';
import { SessionAuthenticator } from '../../auth';
import { CourseBatchDetailsRequest } from '../def/request-types';
import { ApiService } from '../../api/def/api-service';
export declare class GetBatchDetailsHandler implements ApiRequestHandler<CourseBatchDetailsRequest, Batch> {
    private apiService;
    private courseServiceConfig;
    private sessionAuthenticator;
    readonly GET_BATCH_DETAILS_ENDPOINT: string;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: CourseBatchDetailsRequest): Observable<Batch>;
}
