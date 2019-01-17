import {ApiRequestHandler, ApiServiceImpl, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import {Batch, CourseServiceConfig} from '..';
import {SessionAuthenticator} from '../../auth';
import {CourseBatchDetailsRequest} from '../def/request-types';
import {ApiService} from '../../api/def/api-service';

export class GetBatchDetailsHandler implements ApiRequestHandler<CourseBatchDetailsRequest, Batch> {
    public readonly GET_BATCH_DETAILS_ENDPOINT = 'batch/read/';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    public handle(request: CourseBatchDetailsRequest): Observable<Batch> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.courseServiceConfig.apiPath + this.GET_BATCH_DETAILS_ENDPOINT + request.batchId)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest).map((response) => {
            return response.body.result.response;
        });
    }
}
