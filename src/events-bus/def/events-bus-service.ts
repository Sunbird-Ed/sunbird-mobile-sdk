import {Observable} from 'rxjs';
import {EventNamespaces} from './event-namespaces';
import {EmitRequest} from './emit-request';

export interface EventsBusService {
    events(namespace?: EventNamespaces): Observable<any>;

    /** @internal */
    emit(emitRequest: EmitRequest): void;
}

