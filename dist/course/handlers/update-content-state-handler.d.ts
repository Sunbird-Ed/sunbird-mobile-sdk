import { ApiRequestHandler, ApiService } from '../../api';
import { CourseServiceConfig, UpdateContentStateAPIRequest } from '..';
import { Observable } from 'rxjs';
export declare class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, boolean> {
    private apiService;
    private courseServiceConfig;
    private readonly UPDATE_CONTENT_STATE_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<boolean>;
}
