import { DbService } from '../../db';
import { Course, EnrollCourseRequest } from '..';
import { ContentService } from '../../content';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
export declare class OfflineCourseCacheHandler {
    private dbService;
    private contentService;
    private keyValueStore;
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX;
    constructor(dbService: DbService, contentService: ContentService, keyValueStore: KeyValueStore);
    addNewlyEnrolledCourseToGetEnrolledCourses(enrollCourseRequest: EnrollCourseRequest): Observable<boolean>;
    getNewlyAddedCourse(enrollCourseRequest: EnrollCourseRequest): Observable<Course>;
    private getLeafNodeCount;
}
