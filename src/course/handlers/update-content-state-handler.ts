import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, ContentState, CourseServiceConfig, UpdateContentStateAPIRequest, UpdateContentStateRequest} from '..';
import {Observable} from 'rxjs';
import {CourseUtil} from '../course-util';

export class UpdateContentStateHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, boolean> {
    private readonly UPDATE_CONTENT_STATE_ENDPOINT = '/content/state/update';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    public handle(request: UpdateContentStateAPIRequest): Observable<boolean> {
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
