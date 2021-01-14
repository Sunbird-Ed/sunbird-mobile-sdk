import {KeyValueStore} from '../../key-value-store';
import {ContentState, ContentStateResponse, Course, CourseServiceImpl, GetContentStateRequest, UpdateContentStateRequest} from '..';
import {Observable, of} from 'rxjs';
import {ArrayUtil} from '../../util/array-util';
import {map, mergeMap} from 'rxjs/operators';

export class OfflineContentStateHandler {

    constructor(private keyValueStore: KeyValueStore) {

    }

    public getLocalContentStateResponse(request: GetContentStateRequest): Observable<ContentStateResponse> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(request.userId, request.courseId);
        return this.keyValueStore.getValue(key)
            .pipe(
                map((value: string | undefined) => {
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
                    responseContentState.contentList = responseContentState.contentList.map((contentState: ContentState) => {
                        if ((typeof contentState.score as any) === 'string') {
                            contentState.score = undefined;
                        }
                        return contentState;
                    });
                    return responseContentState;
                })
            );

    }

    public manipulateEnrolledCoursesResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean> {
        const key = CourseServiceImpl.GET_ENROLLED_COURSE_KEY_PREFIX.concat(updateContentStateRequest.userId);
        return this.keyValueStore.getValue(key)
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
                        if (courses && courses.length) {
                            const newCourses: Course[] = [...courses];
                            courses.forEach((course: Course) => {
                                if (course.courseId === updateContentStateRequest.courseId &&
                                    course.batchId === updateContentStateRequest.batchId) {
                                    if (!course.contentsPlayedOffline || !course.contentsPlayedOffline!.length) {
                                        course.contentsPlayedOffline = [];
                                    }
                                    if (updateContentStateRequest.status !== 1 && (course.contentsPlayedOffline!.length === 0 ||
                                        (course.contentsPlayedOffline!.length > 0 &&
                                            !ArrayUtil.contains(course.contentsPlayedOffline, updateContentStateRequest.contentId)))) {
                                        course.progress = course.progress ? course.progress : 0;
                                        course.progress = course.progress + 1;
                                        course.completionPercentage =
                                            this.getCourseCompletionPercentage(course.leafNodesCount, course.progress);
                                        const updatedCourse: Course = course;
                                        let playedOffline: string[] = updatedCourse.contentsPlayedOffline!;
                                        if (!playedOffline) {
                                            playedOffline = [];
                                        }
                                        playedOffline.push(updateContentStateRequest.contentId);
                                        updatedCourse.contentsPlayedOffline = playedOffline;
                                        updatedCourse.progress = course.progress;
                                        updatedCourse.completionPercentage = course.completionPercentage;
                                        const toUpdateIndex = newCourses.findIndex((el: Course) => {
                                            return el.contentId === course.contentId || el.batchId === course.batchId;
                                        });
                                        newCourses.splice(toUpdateIndex, 1, updatedCourse);
                                    }

                                }

                            });

                            if (newCourses && newCourses.length) {
                                if (result && result.hasOwnProperty('courses')) {
                                    result['courses'] = newCourses;
                                } else {
                                    response['courses'] = newCourses;
                                }
                                return this.keyValueStore.setValue(key, JSON.stringify(response));
                            } else {
                                return of(false);
                            }

                        } else {
                            return of(false);
                        }
                    } else {
                        return of(false);
                    }

                })
            );
    }

    public manipulateGetContentStateResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(updateContentStateRequest.userId,
            updateContentStateRequest.courseId);
        return this.keyValueStore.getValue(key)
            .pipe(
                mergeMap((value: string | undefined) => {
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
                                            updateContentStateRequest.score = contentState.score;
                                            updateContentStateRequest.bestScore = contentState.bestScore;
                                            newContentState = this.getContentState(updateContentStateRequest);
                                            contentStateList = contentStateList.filter((el: ContentState) => {
                                                return el.contentId !== contentState.contentId;
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
                                    return of(false);
                                }
                            }
                        } else {
                            return of(false);
                        }

                    } else {
                        return of(false);
                    }

                })
            );
    }

    public getCourseCompletionPercentage(leafNodeCount: number | undefined, progress: number) {
        if (leafNodeCount === 0 || leafNodeCount === undefined) {
            return 0;
        }
        const completionData = ((progress / leafNodeCount) * 100);

        if (isNaN(completionData)) {
            return 0;
        } else if (completionData > 100) {
            return 100;
        } else {
            return Math.floor(completionData);
        }
    }

    private getContentState(updateContentStateRequest: UpdateContentStateRequest): ContentState {
        return {
            id: updateContentStateRequest.userId,
            userId: updateContentStateRequest.userId,
            courseId: updateContentStateRequest.courseId,
            contentId: updateContentStateRequest.contentId,
            batchId: updateContentStateRequest.batchId,
            result: updateContentStateRequest.result,
            grade: updateContentStateRequest.grade,
            score: updateContentStateRequest.score,
            bestScore: updateContentStateRequest.bestScore,
            status: updateContentStateRequest.status,
            progress: updateContentStateRequest.progress,
        };
    }
}
