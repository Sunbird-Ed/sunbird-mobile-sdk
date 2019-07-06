import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {CourseServiceConfig, UnenrollCourseRequest} from '../index';
import {Observable} from 'rxjs';

export class UnenrollCourseHandler implements ApiRequestHandler<UnenrollCourseRequest, boolean> {
    private readonly GET_UNENROLL_COURSE_ENDPOINT = '/unenrol';

    constructor(private apiService: HttpService,
                private unenrollCourseServiceApiConfig: CourseServiceConfig) {
    }

    handle(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.unenrollCourseServiceApiConfig.apiPath + this.GET_UNENROLL_COURSE_ENDPOINT)
            .withApiToken(true)
            .withSessionToken(true)
            .withBody({request: unenrollCourseRequest})
            .build();

        return this.apiService.fetch<{ result: { response: string } }>(apiRequest).map((success) => {
            return success.body.result.response === 'SUCCESS';
        });
    }

}
