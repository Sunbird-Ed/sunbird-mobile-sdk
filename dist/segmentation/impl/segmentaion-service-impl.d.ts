import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
import { SegmentationService } from "../def/segmentation-service";
export declare class SegmentationServiceImpl implements SegmentationService {
    private keyValueStore;
    constructor(keyValueStore: KeyValueStore);
    saveTags(tags: string, userId: string): Observable<boolean>;
    getTags(userId: string): Observable<any>;
    removeTagsForId(userid: string): Observable<string>;
    clearAllTags(): Observable<string>;
    saveCommandList(commandList: any, userId: any): Observable<any>;
    getCommand(userId: any): Observable<any>;
}
