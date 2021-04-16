import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";

export class StoreSegmentationTagHandler {
    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(tags: string, userId: string): Observable<boolean> {
        return this.keyValueStore.setValue(userId, tags);
    }
}