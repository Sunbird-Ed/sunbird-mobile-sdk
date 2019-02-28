import {EventsBusService} from '../def/events-bus-service';
import {Observable, Subject} from 'rxjs';
import {EmitRequest} from '../def/emit-request';

interface EventContainer {
    namespace: string;
    event: any;
}

export class EventsBusServiceImpl implements EventsBusService {
    private eventsBus = new Subject<EventContainer>();

    constructor() {
    }

    events(filter?: string): Observable<any> {
        return this.eventsBus.asObservable()
            .filter((eventContainer) => filter ? eventContainer.namespace === filter : true)
            .map((eventContainer) => eventContainer.event);
    }

    emit({namespace, event}: EmitRequest): void {
        this.eventsBus.next({
            namespace,
            event
        });
    }
}
