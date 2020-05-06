import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import {Batch, CourseBatchDetailsRequest, CourseServiceConfig} from '..';
import {map} from 'rxjs/operators';

export class GetBatchDetailsHandler implements ApiRequestHandler<CourseBatchDetailsRequest, Batch> {
    public readonly GET_BATCH_DETAILS_ENDPOINT = '/batch/read/';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    public handle(request: CourseBatchDetailsRequest): Observable<Batch> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.courseServiceConfig.apiPath + this.GET_BATCH_DETAILS_ENDPOINT + request.batchId)
            .withBearerToken(true)
            .withUserToken(true)
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest)
            .pipe(
                map((response) => {
                    return response.body.result.response;
                })
            );
    }
}
