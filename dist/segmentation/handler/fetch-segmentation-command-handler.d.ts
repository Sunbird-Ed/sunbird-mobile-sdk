import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
export declare class FetchSegmentationCommandHandler {
    private keyValueStore;
    private COMMAND_KEY;
    constructor(keyValueStore: KeyValueStore);
    handle(userId: string): Observable<any>;
}
