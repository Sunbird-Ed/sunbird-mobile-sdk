import { EventsBusEvent, EventsBusService } from '..';
import { Observable } from 'rxjs';
import { EmitRequest } from '../def/emit-request';
import { RegisterObserverRequest } from '../def/register-observer-request';
import { EventsBusConfig } from '../config/events-bus-config';
export declare class EventsBusServiceImpl implements EventsBusService {
    private eventsBusConfig;
    private eventsBus;
    private eventDelegates;
    constructor(eventsBusConfig: EventsBusConfig);
    onInit(): Observable<undefined>;
    events(filter?: string): Observable<any>;
    emit({ namespace, event }: EmitRequest<EventsBusEvent>): void;
    registerObserver({ namespace, observer }: RegisterObserverRequest): void;
}
