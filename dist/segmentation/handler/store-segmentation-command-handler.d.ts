import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
export declare class StoreSegmentationCommandHandler {
    private keyValueStore;
    private COMMAND_KEY;
    constructor(keyValueStore: KeyValueStore);
    handle(commandList: any, userId: any): Observable<boolean>;
}
