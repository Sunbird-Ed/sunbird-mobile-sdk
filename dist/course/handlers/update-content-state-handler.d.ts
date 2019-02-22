import { ApiRequestHandler, ApiService } from '../../api';
import { CourseServiceConfig, UpdateContentStateRequest } from '..';
import { Observable } from 'rxjs';
export declare class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateRequest, boolean> {
    private apiService;
    private courseServiceConfig;
    private readonly UPDATE_CONTENT_STATE_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(request: UpdateContentStateRequest): Observable<boolean>;
}
