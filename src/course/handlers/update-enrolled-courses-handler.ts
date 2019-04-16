import {KeyValueStore} from '../../key-value-store';
import {ContentState, ContentStateResponse, Course, GetContentStateRequest} from '..';
import {OfflineContentStateHandler} from './offline-content-state-handler';
import {Observable} from 'rxjs';
import {ArrayUtil} from '../../util/array-util';

export class UpdateEnrolledCoursesHandler {
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX = 'enrolledCourses';

    constructor(private keyValueStore: KeyValueStore,
                private offlineContentStateHandler: OfflineContentStateHandler) {
    }

    updateEnrollCourses(request: GetContentStateRequest): Observable<ContentStateResponse> {
        const enrolledCoursesKey = UpdateEnrolledCoursesHandler.GET_ENROLLED_COURSES_KEY_PREFIX.concat(request.userId);
        return this.offlineContentStateHandler.getLocalContentStateResponse(request).mergeMap((contentState: ContentStateResponse) => {
            return this.keyValueStore.getValue(enrolledCoursesKey)
                .mergeMap((value: string | undefined) => {
                    if (value) {
                        const response = JSON.parse(value);
                        const result = response['result'];
                        let courses: Course[];
                        if (result && result.hasOwnProperty('courses')) {
                            courses = result['courses'];
                        } else {
                            courses = response['courses'];
                        }
                        let newCourses: Course[] = [];
                        newCourses = newCourses.concat(courses);
                        courses.forEach((course: Course) => {
                            if (course.courseId === request.courseIds[0]) {
                                const updateCourse = course;
                                const contentList: ContentState[] = contentState.contentList;
                                contentList.forEach((content) => {
                                    if (content.status === 2) {
                                        let playedOffLine: string[] = course.contentsPlayedOffline!;
                                        if (!playedOffLine) {
                                            playedOffLine = [];
                                        }
                                        playedOffLine.push(content.contentId!);
                                        updateCourse.contentsPlayedOffline = ArrayUtil.deDupe(playedOffLine);
                                    }
                                });
                                // remove old course
                                newCourses = newCourses.filter((el: Course) => {
                                    return el.batchId !== course.batchId;
                                });
                                // add new course
                                newCourses.push(updateCourse);
                            }
                        });

                        if (newCourses && newCourses.length) {
                            if (result && result.hasOwnProperty('courses')) {
                                result['courses'] = newCourses;
                            } else {
                                response['courses'] = newCourses;
                            }
                            return this.keyValueStore.setValue(enrolledCoursesKey, JSON.stringify(response)).map(() => {
                                return contentState;
                            });
                        } else {
                            return Observable.of(contentState);
                        }
                    } else {
                        return Observable.of(contentState);
                    }

                });
        });

    }


}
