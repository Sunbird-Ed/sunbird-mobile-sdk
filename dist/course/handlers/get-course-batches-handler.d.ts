import { ApiRequestHandler } from '../../api';
import { CourseBatchesRequest } from '../def/request-types';
import { Batch, CourseServiceConfig } from '..';
import { Observable } from 'rxjs';
import { SessionAuthenticator } from '../../auth';
import { ProfileService } from '../../profile';
import { ApiService } from '../../api/def/api-service';
export declare class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private apiService;
    private courseServiceConfig;
    private sessionAuthenticator;
    private profileService;
    private readonly GET_COURSE_BATCHES;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, sessionAuthenticator: SessionAuthenticator, profileService: ProfileService);
    handle(request: CourseBatchesRequest): Observable<Batch[]>;
}
