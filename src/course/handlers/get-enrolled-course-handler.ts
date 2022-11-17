import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Course, CourseServiceConfig, CourseServiceImpl, FetchEnrolledCourseRequest} from '..';
import {from, Observable, of} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {GetEnrolledCourseResponse} from '../def/get-enrolled-course-response';
import {SharedPreferences} from '../../util/shared-preferences';
import {catchError, map, mapTo, mergeMap, tap} from 'rxjs/operators';

export class GetEnrolledCourseHandler implements ApiRequestHandler<FetchEnrolledCourseRequest, Course[]> {

    private readonly GET_ENROLLED_COURSES_ENDPOINT = '/user/enrollment/list/';
    private readonly STORED_ENROLLED_COURSES_PREFIX = 'enrolledCourses';

    constructor(
        private keyValueStore: KeyValueStore,
        private apiService: ApiService,
        private courseServiceConfig: CourseServiceConfig,
        private sharedPreference: SharedPreferences,
        private apiHandler?: ApiRequestHandler<{ userId: string }, GetEnrolledCourseResponse>
    ) {
    }

    handle(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        return this.keyValueStore.getValue(this.STORED_ENROLLED_COURSES_PREFIX + request.userId)
            .pipe(
                mergeMap((value: string | undefined) => {
                    if (!value) {
                        return this.fetchFromServer(request).pipe(
                            mergeMap((courses: GetEnrolledCourseResponse) => {
                                return this.keyValueStore.setValue(
                                    this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                                    JSON.stringify(courses)
                                ).pipe(
                                    mapTo(courses.result.courses),
                                    tap((courseList) => {
                                        return from(this.updateLastPlayedContent(courseList));
                                    })
                                );
                            })
                        );
                    } else if (request.returnFreshCourses) {
                        return this.fetchFromServer(request)
                            .pipe(
                                mergeMap((courses: GetEnrolledCourseResponse) => {
                                    return this.keyValueStore.setValue(
                                        this.STORED_ENROLLED_COURSES_PREFIX + request.userId,
                                        JSON.stringify(courses)
                                    ).pipe(
                                        mapTo(courses.result.courses),
                                        tap((courseList) => {
                                            return from(this.updateLastPlayedContent(courseList));
                                        })
                                    );
                                }),
                                catchError(() => {
                                    const response = JSON.parse(value);
                                    const result = response['result'];
                                    let courses: Course[];
                                    if (result && result.hasOwnProperty('courses')) {
                                        courses = result['courses'];
                                    } else {
                                        courses = response['courses'];
                                    }
                                    return of(courses);
                                })
                            );
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
                        return of(courses);
                    }
                })
            );
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
        if (this.apiHandler) {
            return this.apiHandler.handle(request);
        }

        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.courseServiceConfig.apiPath + this.GET_ENROLLED_COURSES_ENDPOINT + request.userId
                + '?orgdetails=orgName,email'
                + '&fields=contentType,topic,name,channel,pkgVersion,primaryCategory,trackable'
                + '&batchDetails=name,endDate,startDate,status,enrollmentType,createdBy,certificates')
            .withBearerToken(true)
            .withUserToken(true)
            .build();

        return this.apiService.fetch<GetEnrolledCourseResponse>(apiRequest)
            .pipe(
                map((response) => {
                    return response.body;
                })
            );
    }
}
