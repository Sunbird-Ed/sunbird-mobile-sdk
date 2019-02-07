import {ApiRequestHandler, HttpRequestType, Request} from '../../api';
import {EnrollCourseRequest} from '..';
import {Observable} from 'rxjs';
import {CourseServiceConfig} from '..';
import {ApiService} from '../../api';

export class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {

    private readonly ENROL_ENDPOINT = 'enrol/';

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
