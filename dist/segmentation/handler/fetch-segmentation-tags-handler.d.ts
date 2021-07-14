import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
export declare class FetchSegmentationTagHandler {
    private keyValueStore;
    private TAG_KEY;
    constructor(keyValueStore: KeyValueStore);
    handle(userId: string): Observable<any>;
}
