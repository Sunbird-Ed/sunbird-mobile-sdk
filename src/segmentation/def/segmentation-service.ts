import { Observable } from "rxjs";

export interface SegmentationService {
    putTags(tags: string, userId: string): Observable<boolean>;
    getTags(userId: string): Observable<any>;
    removeTagsForId(userid: string): Observable<string>;
    clearAllTags(): Observable<string>;
}