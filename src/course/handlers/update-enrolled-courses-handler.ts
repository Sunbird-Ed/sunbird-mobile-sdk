import {KeyValueStore} from '../../key-value-store';
import {ContentState, ContentStateResponse, Course, GetContentStateRequest} from '..';
import {OfflineContentStateHandler} from './offline-content-state-handler';
import {Observable} from 'rxjs';

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
                        const result = JSON.parse(value)['result'];
                        const cousrses: Course[] = result['courses'] as Course[] || [];
                        let newCourses: Course[] = [];
                        newCourses = newCourses.concat(cousrses);
                        cousrses.forEach((course: Course) => {
                            if (course.courseId === request.courseIds[0]) {
                                const updateCourse = course;
                                const contentList: ContentState[] = contentState.contentList;
                                contentList.forEach((content) => {
                                    if (content.status === 2) {
                                        let playedOffLine: Set<string> = course.contentsPlayedOffline!;
                                        if (!playedOffLine) {
                                            playedOffLine = new Set<string>();
                                        }
                                        playedOffLine.add(content.contentId!);
                                        updateCourse.contentsPlayedOffline = playedOffLine;
                                    }
                                });
                                // remove old course
                                newCourses = newCourses.filter((el: Course) => {
                                    return el.courseId !== course.courseId;
                                });
                                // add new course
                                newCourses.push(updateCourse);
                            }
                        });

                        if (newCourses && newCourses.length) {
                            result['courses'] = newCourses;
                            return this.keyValueStore.setValue(enrolledCoursesKey, JSON.stringify(result)).map(() => {
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
