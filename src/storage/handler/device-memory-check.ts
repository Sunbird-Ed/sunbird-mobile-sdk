import {Observable} from 'rxjs';

export class DeviceMemoryCheck {
    constructor() {
    }

    execute(): Observable<void> {
        return Observable.of(undefined);
    }
}
