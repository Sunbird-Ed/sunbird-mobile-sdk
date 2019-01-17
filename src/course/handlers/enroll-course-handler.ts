import {ApiRequestHandler, ApiServiceImpl, HttpRequestType, Request} from '../../api';
import {EnrollCourseRequest} from '../def/request-types';
import {Observable} from 'rxjs';
import {CourseServiceConfig} from '..';
import {SessionAuthenticator} from '../../auth';
import {ApiService} from '../../api/def/api-service';

export class EnrollCourseHandler implements ApiRequestHandler<EnrollCourseRequest, boolean> {

    private readonly ENROL_ENDPOINT = 'enrol/';

    constructor(private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    handle(request: EnrollCourseRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.courseServiceConfig.apiPath + this.ENROL_ENDPOINT)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .withBody({request})
            .build();

        return this.apiService.fetch(apiRequest).map(() => {
            return true;
        });
    }
}
