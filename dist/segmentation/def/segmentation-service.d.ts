import { Observable } from "rxjs";
export interface SegmentationService {
    saveTags(tags: string, userId: string): Observable<boolean>;
    getTags(userId: string): Observable<any>;
    removeTagsForId(userid: string): Observable<string>;
    clearAllTags(): Observable<string>;
    saveCommandList(commandList: string, userId: string): Observable<any>;
    getCommand(userId: string): Observable<any>;
}
