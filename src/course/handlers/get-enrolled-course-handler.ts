import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Course, CourseServiceConfig, FetchEnrolledCourseRequest} from '..';
import {Observable} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';

export class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {

    private readonly GET_ENROLLED_COURSES_ENDPOINT = '/api/course/v1/user/enrollment/list/';
    private readonly STORED_ENROLLED_COURSES_PREFIX = 'enrolledCourses_';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    handle(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        return this.keyValueStore.getValue(this.STORED_ENROLLED_COURSES_PREFIX + request.userId)
            .mergeMap((v: string | undefined) => {
                if (v) {
                    return Observable.of(JSON.parse(v));
                }

                return this.fetchFromServer(request)
                    .do((courses: Course[]) => {
                        this.keyValueStore.setValue(
                            this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                            JSON.stringify(courses)
                        );
                    });
            });
    }

    private fetchFromServer(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.courseServiceConfig.apiPath + this.GET_ENROLLED_COURSES_ENDPOINT + request.userId)
            .withApiToken(true)
            .withSessionToken(true)
            .build();

        return this.apiService.fetch<{ result: Course[] }>(apiRequest).map((response) => {
            return response.body.result;
        });
    }
}
