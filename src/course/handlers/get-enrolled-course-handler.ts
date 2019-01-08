import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {FetchEnrolledCourseRequest} from '../def/request-types';
import {Course, CourseServiceConfig} from '..';
import {Observable} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {SessionAuthenticator} from '../../auth';

export class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {

    private readonly GET_ENROLLED_COURSES_ENDPOINT = 'user/enrollment/list/';
    private readonly STORED_ENROLLED_COURSES_PREFIX = 'enrolledCourses_';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
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
            .withInterceptors([this.sessionAuthenticator])
            .build();

        return this.apiService.fetch<{ result: Course[] }>(apiRequest).map((response) => {
            return response.body.result;
        });
    }
}
