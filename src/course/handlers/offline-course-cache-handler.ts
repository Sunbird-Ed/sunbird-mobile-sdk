import {DbService} from '../../db';
import {Course, EnrollCourseRequest} from '..';
import {Content, ContentService} from '../../content';
import {Observable} from 'rxjs';
import {KeyValueStore} from '../../key-value-store';
import {KeyValueStoreEntry} from '../../key-value-store/db/schema';
import {ContentUtil} from '../../content/util/content-util';

export class OfflineCourseCacheHandler {
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX = 'enrolledCourses';

    constructor(private dbService: DbService,
                private contentService: ContentService,
                private keyValueStore: KeyValueStore) {

    }

    public addNewlyEnrolledCourseToGetEnrolledCourses(enrollCourseRequest: EnrollCourseRequest): Observable<boolean> {
        const key = OfflineCourseCacheHandler.GET_ENROLLED_COURSES_KEY_PREFIX.concat(enrollCourseRequest.userId);
        return this.keyValueStore.getValue(key).mergeMap((enrolledCoursesInDB: string | undefined) => {
            if (!enrolledCoursesInDB) {
                return this.getNewlyAddedCourse(enrollCourseRequest).map((course: Course) => {
                    const courseList: Course[] = [];
                    courseList.push(course);
                    return courseList;
                }).mergeMap((list: Course[]) => {
                    return this.keyValueStore.setValue(key, JSON.stringify(list));
                });
            } else {
                const result = JSON.parse(enrolledCoursesInDB)['result'];
                const courses: Course[] = result['courses'];
                let isCourseAvailable = false;
                courses.forEach((course: Course) => {
                    if (course.courseId === enrollCourseRequest.courseId) {
                        isCourseAvailable = true;
                    }
                });
                if (!isCourseAvailable) {
                    return this.getNewlyAddedCourse(enrollCourseRequest).map((newCourse: Course) => {
                        courses.push(newCourse);
                        result['courses'] = courses;
                        return JSON.stringify(result);
                    }).mergeMap((response: string) => {
                        return this.keyValueStore.setValue(key, response);
                    });
                } else {
                    return Observable.of(true);
                }
            }
        });
    }


    public getNewlyAddedCourse(enrollCourseRequest: EnrollCourseRequest): Observable<Course> {
        return this.contentService.getChildContents({
            contentId: enrollCourseRequest.courseId,
            hierarchyInfo: []
        }).map((result: Content) => {
            return this.getLeafNodeCount(result);
        }).mergeMap((leafNodeCount: number) => {
            return this.contentService.getContentDetails({contentId: enrollCourseRequest.courseId}).mergeMap((content: Content) => {
                const course: Course = {};
                course.progress = 0;
                course.userId = enrollCourseRequest.userId;
                course.batchId = enrollCourseRequest.batchId;
                course.courseId = enrollCourseRequest.courseId;
                course.contentId = enrollCourseRequest.contentId;
                course.leafNodesCount = leafNodeCount;
                if (content) {
                    course.courseName = content.contentData.name;
                    if (content.contentData.appIcon.startsWith('https://')) {
                        course.courseLogoUrl = content.contentData.appIcon;
                    } else {
                        course.courseLogoUrl = ContentUtil.getBasePath(content.basePath.concat('/', content.contentData.appIcon));
                    }
                }
                return Observable.of(course);
            });
        });
    }

    private getLeafNodeCount(content: Content): number {
        let leafNodeCount = 0;
        if (!content.children || !content.children.length) {
            leafNodeCount++;
        } else {
            content.children.forEach((child: Content) => {
                this.getLeafNodeCount(child);
            });
        }
        return leafNodeCount;
    }

}
