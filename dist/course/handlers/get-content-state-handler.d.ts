import { ApiService } from '../../api';
import { CourseServiceConfig, GetContentStateRequest } from '..';
import { Observable } from 'rxjs';
export declare class GetContentStateHandler {
    private apiService;
    private courseServiceConfig;
    private readonly GET_CONTENT_STATE_KEY_PREFIX;
    private readonly GET_CONTENT_STATE_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig);
    handle(contentStateRequest: GetContentStateRequest): Observable<any>;
}
