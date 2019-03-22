import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Course, CourseServiceConfig, FetchEnrolledCourseRequest} from '..';
import {Observable} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {GetEnrolledCourseResponse} from '../def/get-enrolled-course-response';

export class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {

    private readonly GET_ENROLLED_COURSES_ENDPOINT = '/user/enrollment/list/';
    private readonly STORED_ENROLLED_COURSES_PREFIX = 'enrolledCourses';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private courseServiceConfig: CourseServiceConfig) {
    }

    handle(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        return this.keyValueStore.getValue(this.STORED_ENROLLED_COURSES_PREFIX + request.userId)
            .mergeMap((value: string | undefined) => {
                if (!value) {
                    return this.fetchFromServer(request)
                        .mergeMap((courses: GetEnrolledCourseResponse) => {
                            return this.keyValueStore.setValue(
                                this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                                JSON.stringify(courses)
                            ).mapTo(courses.result);
                        });
                } else if (request.returnFreshCourses) {
                    return this.fetchFromServer(request)
                        .mergeMap((courses: GetEnrolledCourseResponse) => {
                            return this.keyValueStore.setValue(
                                this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                                JSON.stringify(courses)
                            ).mapTo(courses.result);
                        });
                } else {
                    return Observable.of(JSON.parse(value)['result']['courses']);
                }
            });
    }

    private fetchFromServer(request: FetchEnrolledCourseRequest): Observable<GetEnrolledCourseResponse> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.courseServiceConfig.apiPath + this.GET_ENROLLED_COURSES_ENDPOINT + request.userId
                + '?batchDetails=name,endDate,startDate,status')
            .withApiToken(true)
            .withSessionToken(true)
            .build();

        return this.apiService.fetch<GetEnrolledCourseResponse>(apiRequest).map((response) => {
            return response.body;
        });
    }
}
