import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseBatchesRequest, CourseServiceConfig} from '..';
import {CourseBatchesResponse} from '../def/course-batches-response';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class GetCourseBatchesHandler implements ApiRequestHandler<CourseBatchesRequest, Batch[]> {
    private readonly GET_COURSE_BATCHES = '/batch/list?creatorDetails';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    handle(request: CourseBatchesRequest): Observable<Batch[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_COURSE_BATCHES)
            .withBearerToken(true)
            .withUserToken(false)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: CourseBatchesResponse } }>(apiRequest)
            .pipe(
                map((response) => {
                    return Array.from<Batch>(new Set(response.body.result.response.content));
                })
            );
    }
}
