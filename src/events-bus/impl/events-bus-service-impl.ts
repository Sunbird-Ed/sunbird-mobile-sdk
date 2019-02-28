import {EventsBusService} from '../def/events-bus-service';
import {Observable, Subject} from 'rxjs';
import {EmitRequest} from '../def/emit-request';
import {RegisterDelegateRequest} from '../def/register-delegate-request';
import {EventDelegate} from '../def/event-delegate';
import {EventNamespace} from '..';

interface EventContainer {
    namespace: string;
    event: any;
}

export class EventsBusServiceImpl implements EventsBusService {
    private eventsBus = new Subject<EventContainer>();
    private eventDelegates: { namespace: EventNamespace, delegate: EventDelegate }[] = [];

    constructor() {
        this.eventsBus
            .mergeMap((eventContainer: EventContainer) => {
                const delegateHandlers = this.eventDelegates
                    .filter((d) => d.namespace === eventContainer.namespace)
                    .map((d) => d.delegate.onEvent(eventContainer.event));

                return Observable.zip(...delegateHandlers);
            })
            .subscribe();
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

    registerDelegate({namespace, delegate}: RegisterDelegateRequest) {
        this.eventDelegates.push({namespace, delegate});
    }
}
