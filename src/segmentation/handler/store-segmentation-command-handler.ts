import { Observable } from "rxjs";
import { KeyValueStore } from "../../key-value-store";

export class StoreSegmentationCommandHandler {

    private COMMAND_KEY = 'segment-command_';

    constructor(
        private keyValueStore: KeyValueStore
    ) {}

    handle(commandList, userId): Observable<boolean> {
        return this.keyValueStore.setValue(this.COMMAND_KEY + userId, commandList);
    }
}
