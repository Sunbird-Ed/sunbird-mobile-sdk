import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { KeyValueStore } from "../../key-value-store";

export class FetchSegmentationTagHandler {
    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(userId: string): Observable<any> {
        return this.keyValueStore.getValue(userId)
        .pipe(
            map((value) => {
                return value ? value : null;
            })
        );
    }
}