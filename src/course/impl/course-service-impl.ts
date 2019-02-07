import {CourseService} from '..';
import {Observable} from 'rxjs';
import {
    CourseBatchDetailsRequest,
    CourseBatchesRequest,
    EnrollCourseRequest,
    FetchEnrolledCourseRequest,
    UpdateContentStateRequest
} from '..';
import {Batch, Course, CourseServiceConfig} from '..';
import {ProfileService} from '../../profile';
import {GetBatchDetailsHandler} from '../handlers/get-batch-details-handler';
import {UpdateContentStateHandler} from '../handlers/update-content-state-handler';
import {GetCourseBatchesHandler} from '../handlers/get-course-batches-handler';
import {GetEnrolledCourseHandler} from '../handlers/get-enrolled-course-handler';
import {EnrollCourseHandler} from '../handlers/enroll-course-handler';
import {KeyValueStore} from '../../key-value-store';
import {ApiService} from '../../api/def/api-service';

export class CourseServiceImpl implements CourseService {

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
}
