import {KeyValueStore} from '../../key-value-store';
import {ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseBatchDetailsRequest, CourseServiceConfig, GetContentStateRequest} from '..';
import {Observable} from 'rxjs';

export class GetContentStateHandler {
    private readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    private readonly GET_CONTENT_STATE_ENDPOINT = 'content/state/read';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {

    }
    public handle(request: GetContentStateRequest): Observable<any> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_CONTENT_STATE_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch<any>(apiRequest).map((response) => {
            return response.body;
        });
    }
}
