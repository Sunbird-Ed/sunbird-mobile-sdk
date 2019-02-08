import {ApiRequestHandler, HttpRequestType, Request} from '../../api';
import {Batch, CourseServiceConfig} from '..';
import {UpdateContentStateRequest} from '..';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';

export class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateRequest, boolean> {
    private readonly UPDATE_CONTENT_STATE_ENDPOINT = '/course/v1/content/state/update';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    public handle(request: UpdateContentStateRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.courseServiceConfig.apiPath + this.UPDATE_CONTENT_STATE_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest).map((response) => {
            return !!response.body.result.response;
        });
    }
}
