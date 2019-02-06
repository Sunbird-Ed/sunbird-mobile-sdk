import {ApiRequestHandler, HttpRequestType, Request} from '../../api';
import {Batch, CourseServiceConfig} from '..';
import {SessionAuthenticator} from '../../auth';
import {UpdateContentStateRequest} from '../def/request-types';
import {Observable} from 'rxjs';
import {ApiService} from '../../api/def/api-service';

export class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateRequest, boolean> {
    private readonly UPDATE_CONTENT_STATE_ENDPOINT = 'content/state/update/';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    public handle(request: UpdateContentStateRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.courseServiceConfig.apiPath + this.UPDATE_CONTENT_STATE_ENDPOINT)
            .withApiToken(true)
            .withResponseInterceptor([this.sessionAuthenticator])
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest).map((response) => {
            return !!response.body.result.response;
        });
    }
}
