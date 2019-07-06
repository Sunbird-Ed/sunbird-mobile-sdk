import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {Course, CourseServiceConfig, CourseServiceImpl, FetchEnrolledCourseRequest} from '../index';
import {Observable} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {GetEnrolledCourseResponse} from '../def/get-enrolled-course-response';
import {SharedPreferences} from '../../../native/shared-preferences';

export class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {

    private readonly GET_ENROLLED_COURSES_ENDPOINT = '/user/enrollment/list/';
    private readonly STORED_ENROLLED_COURSES_PREFIX = 'enrolledCourses';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: HttpService,
                private courseServiceConfig: CourseServiceConfig,
                private sharedPreference: SharedPreferences) {
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
                            ).mapTo(courses.result.courses).do((courseList) => {
                                return Observable.fromPromise(this.updateLastPlayedContent(courseList));
                            });
                        });
                } else if (request.returnFreshCourses) {
                    return this.fetchFromServer(request)
                        .mergeMap((courses: GetEnrolledCourseResponse) => {
                            return this.keyValueStore.setValue(
                                this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                                JSON.stringify(courses)
                            ).mapTo(courses.result.courses).do((courseList) => {
                                return Observable.fromPromise(this.updateLastPlayedContent(courseList));
                            });
                        }).catch(() => {
                            const response = JSON.parse(value);
                            const result = response['result'];
                            let courses: Course[];
                            if (result && result.hasOwnProperty('courses')) {
                                courses = result['courses'];
                            } else {
                                courses = response['courses'];
                            }
                            return Observable.of(courses);
                        });
                } else {
                    // TODO
                    const response = JSON.parse(value);
                    const result = response['result'];
                    let courses: Course[];
                    if (result && result.hasOwnProperty('courses')) {
                        courses = result['courses'];
                    } else {
                        courses = response['courses'];
                    }
                    return Observable.of(courses);
                }
            });
    }

    private async updateLastPlayedContent(courses: Course[]): Promise<boolean> {
        for (const course of courses) {
            const key = CourseServiceImpl.LAST_READ_CONTENTID_PREFIX.concat('_')
                .concat(course['userId']!).concat('_')
                .concat(course['contentId']!).concat('_')
                .concat(course['batchId']!);
            const lastReadContentId = course['lastReadContentId'];
            if (course['lastReadContentId']) {
                await this.sharedPreference.putString(key, lastReadContentId!).toPromise();
            }
        }
        return Promise.resolve(true);
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
