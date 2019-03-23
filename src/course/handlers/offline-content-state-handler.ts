import {KeyValueStore} from '../../key-value-store';
import {ContentState, ContentStateResponse, Course, CourseServiceImpl, GetContentStateRequest, UpdateContentStateRequest} from '..';
import {Observable} from 'rxjs';

export class OfflineContentStateHandler {

    constructor(private keyValueStore: KeyValueStore) {

    }

    public getLocalContentStateResponse(request: GetContentStateRequest): Observable<ContentStateResponse> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(request.userId, request.courseIds[0]);
        return this.keyValueStore.getValue(key).map((value: string | undefined) => {
            const responseContentState: ContentStateResponse = {contentList: []};
            if (value) {
                const response = JSON.parse(value);
                const result = response['result'];
                if (result && result.hasOwnProperty('contentList')) {
                    responseContentState.contentList = result['contentList'];
                    return responseContentState;
                } else {
                    responseContentState.contentList = response['contentList'];
                    return responseContentState;
                }
            }
            return responseContentState;
        });

    }

    public manipulateEnrolledCoursesResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean> {
        const key = CourseServiceImpl.GET_ENROLLED_COURSE_KEY_PREFIX.concat(updateContentStateRequest.userId);
        return this.keyValueStore.getValue(key)
            .mergeMap((value: string | undefined) => {
                if (value) {
                    const result = JSON.parse(value);
                    const courses: Course[] = result['courses'];
                    if (courses && courses.length) {
                        let newCourses: Course[] = [];
                        newCourses = newCourses.concat(courses);
                        courses.forEach((course: Course) => {
                            if (!course.contentsPlayedOffline || !course.contentsPlayedOffline!.size) {
                                course.contentsPlayedOffline = new Set<string>();
                            }
                            if (course.contentsPlayedOffline!.size === 0 ||
                                (course.contentsPlayedOffline!.size > 0 &&
                                    !course.contentsPlayedOffline!.has(updateContentStateRequest.contentId))) {
                                const progress = (course.progress ? course.progress : 0) + 1;
                                const updatedCourse: Course = course;
                                let playedOffline: Set<string> = updatedCourse.contentsPlayedOffline!;
                                if (!playedOffline) {
                                    playedOffline = new Set<string>();
                                }
                                playedOffline.add(updateContentStateRequest.contentId);
                                updatedCourse.contentsPlayedOffline = playedOffline;
                                updatedCourse.progress = progress;

                                // remove old course
                                newCourses = newCourses.filter((el: Course) => {
                                    return el.courseId !== course.courseId;
                                });
                                // add new course
                                newCourses.push(updatedCourse);
                            }

                        });

                        if (newCourses && newCourses.length) {
                            result['courses'] = newCourses;
                            return this.keyValueStore.setValue(key, JSON.stringify(result));
                        } else {
                            return Observable.of(false);
                        }

                    } else {
                        return Observable.of(false);
                    }
                } else {
                    return Observable.of(false);
                }

            });
    }

    public manipulateGetContentStateResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(updateContentStateRequest.userId,
            updateContentStateRequest.courseId);
        return this.keyValueStore.getValue(key)
            .mergeMap((value: string | undefined) => {
                if (value) {
                    const contentStateResponse: ContentStateResponse = {contentList: []};
                    const response = JSON.parse(value);
                    const result = response['result'];
                    if (result && result.hasOwnProperty('contentList')) {
                        contentStateResponse.contentList = result['contentList'];
                    } else {
                        contentStateResponse.contentList = response['contentList'];
                    }
                    if (contentStateResponse) {
                        let contentStateList: ContentState[] = contentStateResponse.contentList;
                        let newContentState: ContentState;
                        if (!contentStateList || !contentStateList.length) {
                            newContentState = this.getContentState(updateContentStateRequest);
                            contentStateList = [];
                            contentStateList.push(newContentState);
                            contentStateResponse.contentList = contentStateList;
                            return this.keyValueStore.setValue(key, JSON.stringify(contentStateResponse));
                        } else {
                            contentStateList.forEach((contentState: ContentState) => {
                                if (contentState.contentId === updateContentStateRequest.contentId) {
                                    if (contentState.status !== updateContentStateRequest.status) {
                                        newContentState = this.getContentState(updateContentStateRequest);
                                        contentStateList = contentStateList.filter((el: ContentState) => {
                                            return el.courseId !== contentState.courseId;
                                        });
                                    }
                                } else {
                                    newContentState = this.getContentState(updateContentStateRequest);
                                }
                            });

                            if (newContentState!) {
                                contentStateList.push(newContentState!);
                                contentStateResponse.contentList = contentStateList;
                                return this.keyValueStore.setValue(key, JSON.stringify(contentStateResponse));
                            } else {
                                return Observable.of(false);
                            }
                        }
                    } else {
                        return Observable.of(false);
                    }

                } else {
                    return Observable.of(false);
                }

            });
    }

    private getContentState(updateContentStateRequest: UpdateContentStateRequest): ContentState {
        const contentState: ContentState = {};
        contentState.id = updateContentStateRequest.userId;
        contentState.courseId = updateContentStateRequest.courseId;
        contentState.contentId = updateContentStateRequest.contentId;
        contentState.batchId = updateContentStateRequest.batchId;
        contentState.result = updateContentStateRequest.result;
        contentState.grade = updateContentStateRequest.grade;
        contentState.score = updateContentStateRequest.score;
        contentState.status = updateContentStateRequest.status;
        contentState.progress = updateContentStateRequest.progress;
        return contentState;
    }
}
