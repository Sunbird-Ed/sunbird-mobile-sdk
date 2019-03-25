import {
    Batch,
    ContentStateResponse,
    Course,
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    CourseService,
    CourseServiceConfig,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    GetContentStateRequest,
    UpdateContentStateRequest
} from '..';
import {Observable} from 'rxjs';
import {ProfileService} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateHandler} from '../handlers/update-content-state-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService} from '../../api';
import {UnenrollCourseRequest} from '../def/unenrollCourseRequest';
import {UnenrollCourseHandler} from '../handlers/unenroll-course-handler';
import {DbService} from '../../db';
import {ContentKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {OfflineCourseCacheHandler} from '../handlers/offline-course-cache-handler';
import {ContentService} from '../../content';
import {GetContentStateHandler} from '../handlers/get-content-state-handler';
import {UpdateEnrolledCoursesHandler} from '../handlers/update-enrolled-courses-handler';
import {OfflineContentStateHandler} from '../handlers/offline-content-state-handler';
import {CourseUtil} from '../course-util';
import {ContentStatesHandler} from '../handlers/content-states-handler';

export class CourseServiceImpl implements CourseService {

    public static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    public static readonly GET_ENROLLED_COURSE_KEY_PREFIX = 'enrolledCourses';
    public static readonly UPDATE_CONTENT_STATE_KEY_PREFIX = 'updateContentState';

    constructor(private courseServiceConfig: CourseServiceConfig,
                private apiService: ApiService,
                private profileService: ProfileService,
                private keyValueStore: KeyValueStore,
                private dbService: DbService,
                private sharedPreferences: SharedPreferences,
                private contentService: ContentService) {
    }

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        const offlineContentStateHandler: OfflineContentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        return new UpdateContentStateHandler(this.apiService, this.courseServiceConfig)
            .handle(CourseUtil.getUpdateContentStateRequest(request))
            // .mergeMap((updateContentResponse: boolean) => {
            //     const whereClause = ` WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY}
            //                           LIKE '%%${CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX}%%'`;
            //     if (updateContentResponse) {
            //         const query = `SELECT * FROM ${KeyValueStoreEntry.TABLE_NAME}
            //                        WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY}
            //                        LIKE '%%${CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX}%%'`;
            //         return this.dbService.execute(query).mergeMap((keyValueEntries: KeyValueStoreEntry.SchemaMap[]) => {
            //             if (keyValueEntries && keyValueEntries.length) {
            //                 const deleteQuery = `DELETE FROM ${KeyValueStoreEntry.TABLE_NAME} ${whereClause}`;
            //                 return this.dbService.execute(deleteQuery);
            //             } else {
            //                 return Observable.of(false);
            //             }
            //
            //         }).mergeMap((isDeleted: boolean) => {
            //             return this.sharedPreferences.putBoolean(ContentKeys.UPDATE_CONTENT_STATE, false);
            //         });
            //     } else {
            //         return Observable.of(false);
            //     }
            // })
            .catch(() => {
                const key = CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX.concat(request.userId,
                    request.courseId, request.contentId, request.batchId);
                return this.keyValueStore.getValue(key).mergeMap((value: string | undefined) => {
                    return this.keyValueStore.setValue(key, JSON.stringify(request));
                }).mergeMap(() => {
                    return this.sharedPreferences.putBoolean(ContentKeys.UPDATE_CONTENT_STATE, true);
                });
            }).mergeMap(() => {
                return offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request);
            }).mergeMap(() => {
                return offlineContentStateHandler.manipulateGetContentStateResponseLocally(request);
            });
    }

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]> {
        return new GetCourseBatchesHandler(
            this.apiService, this.courseServiceConfig, this.profileService)
            .handle(request);
    }

    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        const updateContentStateHandler: UpdateContentStateHandler =
            new UpdateContentStateHandler(this.apiService, this.courseServiceConfig);
        return new ContentStatesHandler(updateContentStateHandler, this.dbService, this.sharedPreferences)
            .updateContentState().mergeMap(() => {
                return new GetEnrolledCourseHandler(
                    this.keyValueStore, this.apiService, this.courseServiceConfig).handle(request);
            });

    }

    enrollCourse(request: EnrollCourseRequest): Observable<boolean> {
        return new EnrollCourseHandler(this.apiService, this.courseServiceConfig)
            .handle(request).mergeMap((enrollCourseResponse: boolean) => {
                const courseContext: { [key: string]: any } = {};
                courseContext['userId'] = request.userId;
                courseContext['courseId'] = request.courseId;
                courseContext['batchId'] = request.batchId;
                return this.sharedPreferences.putString(ContentKeys.COURSE_CONTEXT, JSON.stringify(courseContext));
            }).mergeMap(() => {
                return new OfflineCourseCacheHandler(this.dbService, this.contentService, this.keyValueStore)
                    .addNewlyEnrolledCourseToGetEnrolledCourses(request);
            });
    }

    getContentState(request: GetContentStateRequest): Observable<ContentStateResponse | undefined> {
        const key = CourseServiceImpl.GET_CONTENT_STATE_KEY_PREFIX.concat(request.userId, request.courseIds[0]);
        const offlinecontentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        const updateCourseHandler: UpdateEnrolledCoursesHandler =
            new UpdateEnrolledCoursesHandler(this.keyValueStore, offlinecontentStateHandler);
        return this.keyValueStore.getValue(key).mergeMap((value?: string) => {
            if (!value) {
                return new GetContentStateHandler(this.apiService, this.courseServiceConfig)
                    .handle(request).mergeMap((response: any) => {
                        if (response) {
                            return this.keyValueStore.setValue(key, JSON.stringify(response)).mergeMap(() => {
                                return updateCourseHandler.updateEnrollCourses(request);
                            });
                        } else {
                            return Observable.of<ContentStateResponse | undefined>(undefined);
                        }
                    });
            } else {
                return offlinecontentStateHandler.getLocalContentStateResponse(request);
            }
        });
    }

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        return new UnenrollCourseHandler(this.apiService, this.courseServiceConfig).handle(unenrollCourseRequest);
    }

    checkContentStatus(request: GetContentStateRequest): Observable<number> {
        return Observable.of(0);
    }

}
