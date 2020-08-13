import {KeyValueStore} from '../../key-value-store';
import {ContentState, ContentStateResponse, Course, GetContentStateRequest} from '..';
import {OfflineContentStateHandler} from './offline-content-state-handler';
import {Observable, of} from 'rxjs';
import {ArrayUtil} from '../../util/array-util';
import {map, mergeMap} from 'rxjs/operators';

export class UpdateEnrolledCoursesHandler {
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX = 'enrolledCourses';

    constructor(private keyValueStore: KeyValueStore,
                private offlineContentStateHandler: OfflineContentStateHandler) {
    }

    updateEnrollCourses(request: GetContentStateRequest): Observable<ContentStateResponse> {
        const enrolledCoursesKey = UpdateEnrolledCoursesHandler.GET_ENROLLED_COURSES_KEY_PREFIX.concat(request.userId);
        return this.offlineContentStateHandler.getLocalContentStateResponse(request)
            .pipe(
                mergeMap((contentState: ContentStateResponse) => {
                    return this.keyValueStore.getValue(enrolledCoursesKey)
                        .pipe(
                            mergeMap((value: string | undefined) => {
                                if (value) {
                                    const response = JSON.parse(value);
                                    const result = response['result'];
                                    let courses: Course[];
                                    if (result && result.hasOwnProperty('courses')) {
                                        courses = result['courses'];
                                    } else {
                                        courses = response['courses'];
                                    }
                                    const newCourses: Course[] = [...courses];
                                    courses.forEach((course: Course) => {
                                        if (course.courseId === request.courseId && course.batchId === request.batchId) {
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

                                            const toUpdateIndex = newCourses.findIndex((el: Course) => {
                                                return el.contentId === course.contentId && el.batchId === course.batchId;
                                            });
                                            newCourses.splice(toUpdateIndex, 1, updateCourse);
                                        }
                                    });

                                    if (newCourses && newCourses.length) {
                                        if (result && result.hasOwnProperty('courses')) {
                                            result['courses'] = newCourses;
                                        } else {
                                            response['courses'] = newCourses;
                                        }
                                        return this.keyValueStore.setValue(enrolledCoursesKey, JSON.stringify(response))
                                            .pipe(
                                                map(() => {
                                                    return contentState;
                                                })
                                            );
                                    } else {
                                        return of(contentState);
                                    }
                                } else {
                                    return of(contentState);
                                }

                            })
                        );
                })
            );

    }


}
