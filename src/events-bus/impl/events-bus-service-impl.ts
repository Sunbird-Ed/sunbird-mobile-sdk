import {EventBusEvent, EventNamespace, EventsBusService} from '..';
import {Observable, Subject} from 'rxjs';
import {EmitRequest} from '../def/emit-request';
import {RegisterObserverRequest} from '../def/register-observer-request';
import {EventObserver} from '../def/event-observer';
import {EventsBusConfig} from '../config/events-bus-config';

interface EventContainer {
    namespace: string;
    event: EventBusEvent;
}

export class EventsBusServiceImpl implements EventsBusService {
    private eventsBus = new Subject<EventContainer>();
    private eventDelegates: { namespace: EventNamespace, observer: EventObserver }[] = [];

    constructor(private eventsBusConfig: EventsBusConfig) {
    }

    onInit(): Observable<undefined> {
        return this.eventsBus
            .do((eventContainer: EventContainer) => {
                if (this.eventsBusConfig.debugMode === true) {
                    console.log(eventContainer);
                }
            })
            .mergeMap((eventContainer: EventContainer) => {
                const delegateHandlers = this.eventDelegates
                    .filter((d) => d.namespace === eventContainer.namespace)
                    .map((d) => d.observer.onEvent(eventContainer.event));

                return Observable.zip(...delegateHandlers).mapTo(undefined);
            });
    }

    events(filter?: string): Observable<any> {
        return this.eventsBus.asObservable()
            .filter((eventContainer) => filter ? eventContainer.namespace === filter : true)
            .map((eventContainer) => eventContainer.event);
    }

    emit({namespace, event}: EmitRequest<EventBusEvent>): void {
        this.eventsBus.next({
            namespace,
            event
        });
    }

    registerObserver({namespace, observer}: RegisterObserverRequest) {
        this.eventDelegates.push({namespace, observer});
    }
}
