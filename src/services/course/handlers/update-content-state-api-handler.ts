import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {Batch, CourseServiceConfig, UpdateContentStateAPIRequest} from '../index';
import {Observable} from 'rxjs';

export class UpdateContentStateApiHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, {[key: string]: any}> {
    private readonly UPDATE_CONTENT_STATE_ENDPOINT = '/content/state/update';


    constructor(private apiService: HttpService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    public handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<{[key: string]: any}> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.courseServiceConfig.apiPath + this.UPDATE_CONTENT_STATE_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request: updateContentStateAPIRequest})
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest).map((response) => {
            return response.body.result;
        });
    }

}
