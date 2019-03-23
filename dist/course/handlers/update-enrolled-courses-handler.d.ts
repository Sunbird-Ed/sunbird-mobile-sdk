import { KeyValueStore } from '../../key-value-store';
import { ContentStateResponse, GetContentStateRequest } from '..';
import { OfflineContentStateHandler } from './offline-content-state-handler';
import { Observable } from 'rxjs';
export declare class UpdateEnrolledCoursesHandler {
    private keyValueStore;
    private offlineContentStateHandler;
    private static readonly GET_ENROLLED_COURSES_KEY_PREFIX;
    constructor(keyValueStore: KeyValueStore, offlineContentStateHandler: OfflineContentStateHandler);
    updateEnrollCourses(request: GetContentStateRequest): Observable<ContentStateResponse>;
}
