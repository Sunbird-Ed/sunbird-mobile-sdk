import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {CourseServiceConfig, EnrollCourseRequest} from '..';
import {Observable} from 'rxjs';

export class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {

    private readonly ENROL_ENDPOINT = '/api/enrol/';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    handle(request: EnrollCourseRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.ENROL_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request})
            .build();

        return this.apiService.fetch(apiRequest).map(() => {
            return true;
        });
    }
}
