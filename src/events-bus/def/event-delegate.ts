import {Observable} from 'rxjs';

export interface EventDelegate {
    onEvent(event: any): Observable<undefined>;
}
