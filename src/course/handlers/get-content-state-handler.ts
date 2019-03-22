import {ApiService, HttpRequestType, Request} from '../../api';
import {CourseServiceConfig, GetContentStateRequest} from '..';
import {Observable} from 'rxjs';

export class GetContentStateHandler {
    private readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    private readonly GET_CONTENT_STATE_ENDPOINT = '/content/state/read';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {

    }

    public handle(contentStateRequest: GetContentStateRequest): Observable<any> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.GET_CONTENT_STATE_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request: contentStateRequest})
            .build();

        return this.apiService.fetch<any>(apiRequest).map((response) => {
            return response.body;
        });
    }
}
