import { ApiService } from '../../api';
import { ContentState, CourseServiceConfig, GetContentStateRequest } from '..';
import { Observable } from 'rxjs';
import { Container } from 'inversify';
export declare class GetContentStateHandler {
    private apiService;
    private courseServiceConfig;
    private container;
    constructor(apiService: ApiService, courseServiceConfig: CourseServiceConfig, container: Container);
    private readonly csCourseService;
    private readonly contentService;
    handle(contentStateRequest: GetContentStateRequest): Observable<{
        contentList: ContentState[];
    }>;
    private fetchFromApi;
}
