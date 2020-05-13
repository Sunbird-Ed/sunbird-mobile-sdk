import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseServiceConfig, UpdateContentStateAPIRequest} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class UpdateContentStateApiHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, { [key: string]: any }> {
    private readonly UPDATE_CONTENT_STATE_ENDPOINT = '/content/state/update';


    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    public handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<{ [key: string]: any }> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(this.courseServiceConfig.apiPath + this.UPDATE_CONTENT_STATE_ENDPOINT)
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({request: updateContentStateAPIRequest})
            .build();

        return this.apiService.fetch<{ result: { response: Batch } }>(apiRequest)
            .pipe(
                map((response) => {
                    return response.body.result;
                })
            );
    }

}
