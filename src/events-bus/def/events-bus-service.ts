import {Observable} from 'rxjs';
import {EventNamespaces} from './event-namespaces';

export interface EventsBusService {
    events(namespace?: EventNamespaces): Observable<any>;

    /** @internal */
    emit(namespace: EventNamespaces, event: any): void;
}

