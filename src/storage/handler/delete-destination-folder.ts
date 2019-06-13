import {Observable} from 'rxjs';

export class DeleteDestinationFolder {
    constructor() {
    }

    execute(): Observable<void> {
        return Observable.of(undefined);
    }
}
