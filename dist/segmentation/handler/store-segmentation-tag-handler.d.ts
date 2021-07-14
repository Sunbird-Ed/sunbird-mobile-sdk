import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
export declare class StoreSegmentationTagHandler {
    private keyValueStore;
    private TAG_KEY;
    constructor(keyValueStore: KeyValueStore);
    handle(tags: string, userId: string): Observable<boolean>;
}
