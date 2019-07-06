import {Observable} from 'rxjs';
import {EventsBusEvent} from './events-bus-event';

export interface EventObserver<T extends EventsBusEvent> {
    onEvent(event: T): Observable<undefined>;
}
