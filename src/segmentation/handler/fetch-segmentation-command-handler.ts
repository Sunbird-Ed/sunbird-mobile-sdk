import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { KeyValueStore } from "../../key-value-store";

export class FetchSegmentationCommandHandler {

    private COMMAND_KEY = 'segment-command_';

    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(userId: string): Observable<any> {
        return this.keyValueStore.getValue(this.COMMAND_KEY + userId)
        .pipe(
            map((value) => {
                return value ? value : null;
            })
        );
    }
}