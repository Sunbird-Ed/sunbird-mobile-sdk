import {Observable} from 'rxjs';

export class DeleteSourceFolder {
    constructor() {
    }

    execute(): Observable<void> {
        return Observable.of(undefined);
    }
}
