import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { KeyValueStore } from "../../key-value-store";

export class FetchSegmentationTagHandler {

    private TAG_KEY = 'segment-tag_';

    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(userId: string): Observable<any> {
        return this.keyValueStore.getValue(this.TAG_KEY + userId)
        .pipe(
            map((value) => {
                return value ? value : null;
            })
        );
    }
}