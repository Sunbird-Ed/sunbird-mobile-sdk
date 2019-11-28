import {DbService} from '../../db';
import {Course, EnrollCourseRequest} from '..';
import {Content, ContentService} from '../../content';
import {Observable, of} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {ContentUtil} from '../../content/util/content-util';
import {map, mergeMap} from 'rxjs/operators';

export class OfflineCourseCacheHandler {
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX = 'enrolledCourses';

    constructor(private dbService: DbService,
                private contentService: ContentService,
                private keyValueStore: KeyValueStore) {

    }

    public addNewlyEnrolledCourseToGetEnrolledCourses(enrollCourseRequest: EnrollCourseRequest): Observable<boolean> {
        const key = OfflineCourseCacheHandler.GET_ENROLLED_COURSES_KEY_PREFIX.concat(enrollCourseRequest.userId);
        return this.keyValueStore.getValue(key)
            .pipe(
                mergeMap((enrolledCoursesInDB: string | undefined) => {
                    if (!enrolledCoursesInDB) {
                        return this.getNewlyAddedCourse(enrollCourseRequest)
                            .pipe(
                                map((course: Course) => {
                                    const courseList: Course[] = [];
                                    courseList.push(course);
                                    return courseList;
                                }),
                                mergeMap((list: Course[]) => {
                                    return this.keyValueStore.setValue(key, JSON.stringify(list));
                                })
                            );
                    } else {
                        const response = JSON.parse(enrolledCoursesInDB);
                        const result = response['result'];
                        let courses: Course[];
                        if (result && result.hasOwnProperty('courses')) {
                            courses = result['courses'];
                        } else {
                            courses = response['courses'];
                        }
                        let isCourseAvailable = false;
                        courses.forEach((course: Course) => {
                            if (course.courseId === enrollCourseRequest.courseId) {
                                isCourseAvailable = true;
                            }
                        });
                        if (!isCourseAvailable) {
                            return this.getNewlyAddedCourse(enrollCourseRequest)
                                .pipe(
                                    map((newCourse: Course) => {
                                        courses.push(newCourse);
                                        if (result && result.hasOwnProperty('courses')) {
                                            result['courses'] = courses;
                                        } else {
                                            response['courses'] = courses;
                                        }
                                        return JSON.stringify(response);
                                    }),
                                    mergeMap((value: string) => {
                                        return this.keyValueStore.setValue(key, value);
                                    })
                                );
                        } else {
                            return of(true);
                        }
                    }
                })
            );
    }


    public getNewlyAddedCourse(enrollCourseRequest: EnrollCourseRequest): Observable<Course> {
        return this.contentService.getChildContents({
            contentId: enrollCourseRequest.courseId,
            hierarchyInfo: []
        })
            .pipe(
                map((result: Content) => {
                    return this.getLeafNodeCount(result);
                }),
                mergeMap((leafNodeCount: number) => {
                    return this.contentService.getContentDetails({contentId: enrollCourseRequest.courseId})
                        .pipe(
                            mergeMap((content: Content) => {
                                const course: Course = {};
                                course.progress = 0;
                                course.userId = enrollCourseRequest.userId;
                                course.batchId = enrollCourseRequest.batchId;
                                course.courseId = enrollCourseRequest.courseId;
                                course.contentId = enrollCourseRequest.courseId;
                                course.leafNodesCount = leafNodeCount;
                                const batch: { [key: string]: any } = {};
                                batch['identifier'] = enrollCourseRequest.batchId;
                                batch['status'] = enrollCourseRequest.batchStatus;
                                course.batch = batch;
                                if (content) {
                                    course.courseName = content.contentData.name;
                                    if (content.contentData.appIcon.startsWith('https://')) {
                                        course.courseLogoUrl = content.contentData.appIcon;
                                    } else {
                                        course.courseLogoUrl = ContentUtil
                                            .getBasePath(content.basePath.concat('/', content.contentData.appIcon));
                                    }
                                }
                                return of(course);
                            })
                        );
                })
            );
    }

    private getLeafNodeCount(obj: Content): number {
        if (!obj.children || !obj.children.length) {
            return 1;
        }

        return obj.children.reduce((acc, child) => {
            acc += this.getLeafNodeCount(child);

            return acc;
        }, 0);
    }

}
