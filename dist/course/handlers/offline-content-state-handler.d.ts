import { KeyValueStore } from '../../key-value-store';
import { ContentStateResponse, GetContentStateRequest, UpdateContentStateRequest } from '..';
import { Observable } from 'rxjs';
export declare class OfflineContentStateHandler {
    private keyValueStore;
    constructor(keyValueStore: KeyValueStore);
    getLocalContentStateResponse(request: GetContentStateRequest): Observable<ContentStateResponse>;
    manipulateEnrolledCoursesResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean>;
    manipulateGetContentStateResponseLocally(updateContentStateRequest: UpdateContentStateRequest): Observable<boolean>;
    getCourseCompletionPercentage(leafNodeCount: number | undefined, progress: number): number;
    private getContentState;
}
