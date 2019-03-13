import {Observable} from 'rxjs';

export interface EventObserver {
    onEvent(event: any): Observable<undefined>;
}
