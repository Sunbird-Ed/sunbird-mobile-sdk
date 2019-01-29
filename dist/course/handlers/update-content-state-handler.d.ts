import { ApiRequestHandler } from '../../api';
import { CourseServiceConfig } from '..';
import { SessionAuthenticator } from '../../auth';
import { UpdateContentStateRequest } from '../def/request-types';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/def/api-service';
export declare class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateRequest, boolean> {
    private apiService;
    private courseServiceConfig;
    private sessionAuthenticator;
    private readonly UPDATE_CONTENT_STATE_ENDPOINT;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: UpdateContentStateRequest): Observable<boolean>;
}
