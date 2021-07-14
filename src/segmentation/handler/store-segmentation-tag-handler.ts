import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";

export class StoreSegmentationTagHandler {

    private TAG_KEY = 'segment-tag_';

    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(tags: string, userId: string): Observable<boolean> {
        return this.keyValueStore.setValue(this.TAG_KEY + userId, tags);
    }
}