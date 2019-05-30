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
import {UpdateContentStateApiHandler} from '../handlers/update-content-state-api-handler';
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
import {ContentStatesSyncHandler} from '../handlers/content-states-sync-handler';
import {ProcessingError} from '../../auth/errors/processing-error';
import { injectable, inject } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';

@injectable()
export class CourseServiceImpl implements CourseService {

    public static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';
    public static readonly GET_ENROLLED_COURSE_KEY_PREFIX = 'enrolledCourses';
    public static readonly UPDATE_CONTENT_STATE_KEY_PREFIX = 'updateContentState';
    public static readonly LAST_READ_CONTENTID_PREFIX = 'lastReadContentId';
    private courseServiceConfig: CourseServiceConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        ) {
        this.courseServiceConfig = this.sdkConfig.courseServiceConfig;
    }

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        const offlineContentStateHandler: OfflineContentStateHandler = new OfflineContentStateHandler(this.keyValueStore);
        return new UpdateContentStateApiHandler(this.apiService, this.courseServiceConfig)
            .handle(CourseUtil.getUpdateContentStateRequest(request)).map((response: { [key: string]: any }) => {
                if (response.hasOwnProperty(request.contentId) ||
                    response[request.contentId] !== 'FAILED') {
                    return true;
                }
                throw new ProcessingError('Request processing failed');
            })
            .catch((error) => {
                const key = CourseServiceImpl.UPDATE_CONTENT_STATE_KEY_PREFIX.concat(request.userId,
                    request.courseId, request.contentId, request.batchId);
                return this.keyValueStore.getValue(key).mergeMap((value: string | undefined) => {
                    return this.keyValueStore.setValue(key, JSON.stringify(request));
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
        const updateContentStateHandler: UpdateContentStateApiHandler =
            new UpdateContentStateApiHandler(this.apiService, this.courseServiceConfig);
        return new ContentStatesSyncHandler(updateContentStateHandler, this.dbService, this.sharedPreferences, this.keyValueStore)
            .updateContentState().mergeMap(() => {
                return new GetEnrolledCourseHandler(
                    this.keyValueStore, this.apiService, this.courseServiceConfig, this.sharedPreferences).handle(request);
            });

    }

    enrollCourse(request: EnrollCourseRequest): Observable<boolean> {
        return new EnrollCourseHandler(this.apiService, this.courseServiceConfig)
            .handle(request).mergeMap(() => {
                const courseContext: { [key: string]: any } = {};
                courseContext['userId'] = request.userId;
                courseContext['batchStatus'] = request.batchStatus;
                return this.sharedPreferences.putString(ContentKeys.COURSE_CONTEXT, JSON.stringify(courseContext));
            }).delay(2000).concatMap(() => {
                return this.getEnrolledCourses({userId: request.userId, returnFreshCourses: true});
            }).mapTo(true);
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
                                return offlinecontentStateHandler.getLocalContentStateResponse(request);
                            }).mergeMap(() => {
                                return updateCourseHandler.updateEnrollCourses(request);
                            });
                        } else {
                            return Observable.of<ContentStateResponse | undefined>(undefined);
                        }
                    }).catch((error) => {
                        return offlinecontentStateHandler.getLocalContentStateResponse(request).mergeMap(() => {
                            return updateCourseHandler.updateEnrollCourses(request);
                        });
                    });
            } else if (request.returnRefreshedContentStates) {
                return new GetContentStateHandler(this.apiService, this.courseServiceConfig)
                    .handle(request).mergeMap((response: any) => {
                        if (response) {
                            return this.keyValueStore.setValue(key, JSON.stringify(response)).mergeMap(() => {
                                return offlinecontentStateHandler.getLocalContentStateResponse(request);
                            }).mergeMap(() => {
                                return updateCourseHandler.updateEnrollCourses(request);
                            });
                        } else {
                            return Observable.of<ContentStateResponse | undefined>(undefined);
                        }
                    }).catch((error) => {
                        return offlinecontentStateHandler.getLocalContentStateResponse(request).mergeMap(() => {
                            return updateCourseHandler.updateEnrollCourses(request);
                        });
                    });
            } else {
                return offlinecontentStateHandler.getLocalContentStateResponse(request);
            }
        });
    }

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        return new UnenrollCourseHandler(this.apiService, this.courseServiceConfig).handle(unenrollCourseRequest)
            .delay(2000).concatMap(() => {
                return this.getEnrolledCourses({userId: unenrollCourseRequest.userId, returnFreshCourses: true});
            }).mapTo(true);
    }

    checkContentStatus(request: GetContentStateRequest): Observable<number> {
        return Observable.of(0);
    }

}
