import { ApiRequestHandler, ApiService } from '../../api';
import { CourseServiceConfig, UpdateContentStateAPIRequest } from '..';
import { Observable } from 'rxjs';
export declare class UpdateContentStateApiHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, {
    [key: string]: any;
}> {
    private apiService;
    private courseServiceConfig;
    private readonly UPDATE_CONTENT_STATE_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<{
        [key: string]: any;
    }>;
}
