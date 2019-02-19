import {CourseService, GetContentStateRequest} from '..';
import {Observable} from 'rxjs';
import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    UpdateContentStateRequest
} from '..';
import {Batch, Course, CourseServiceConfig} from '..';
import {Profile, ProfileService, ProfileSession} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateHandler} from '../handlers/update-content-state-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService} from '../../api';
import {UnenrollCourseRequest} from '../def/unenrollCourseRequest';
import {UnenrollCourseHandler} from '../handlers/unenroll-course-handler';

export class CourseServiceImpl implements CourseService {
    private static readonly GET_CONTENT_STATE_KEY_PREFIX = 'getContentState';

    constructor(private courseServiceConfig: CourseServiceConfig,
                private apiService: ApiService,
                private profileService: ProfileService,
                private keyValueStore: KeyValueStore) {
    }

    getBatchDetails(request: CourseBatchDetailsRequest): Observable<Batch> {
        return new GetBatchDetailsHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    updateContentState(request: UpdateContentStateRequest): Observable<boolean> {
        return new UpdateContentStateHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    getCourseBatches(request: CourseBatchesRequest): Observable<Batch[]> {
        return new GetCourseBatchesHandler(
            this.apiService, this.courseServiceConfig, this.profileService)
            .handle(request);
    }

    getEnrolledCourses(request: FetchEnrolledCourseRequest): Observable<Course[]> {
        return new GetEnrolledCourseHandler(
            this.keyValueStore, this.apiService, this.courseServiceConfig).handle(request);
    }

    enrollCourse(request: EnrollCourseRequest): Observable<boolean> {
        return new EnrollCourseHandler(this.apiService, this.courseServiceConfig)
            .handle(request);
    }

    getContentState(request: GetContentStateRequest): Observable<boolean> {
        return Observable.of(true);
    }

    unenrollCourse(unenrollCourseRequest: UnenrollCourseRequest): Observable<boolean> {
        return new UnenrollCourseHandler(this.apiService, this.courseServiceConfig).handle(unenrollCourseRequest);
    }

}
