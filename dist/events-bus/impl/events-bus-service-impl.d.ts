import { EventsBusEvent, EventsBusService } from '..';
import { Observable } from 'rxjs';
import { EmitRequest } from '../def/emit-request';
import { RegisterObserverRequest } from '../def/register-observer-request';
import { SdkConfig } from '../../sdk-config';
export declare class EventsBusServiceImpl implements EventsBusService {
    private sdkConfig;
    private eventsBus;
    private eventDelegates;
    private eventsBusConfig;
    constructor(sdkConfig: SdkConfig);
    onInit(): Observable<undefined>;
    events(eventFilter?: string): Observable<any>;
    emit({ namespace, event }: EmitRequest<EventsBusEvent>): void;
    registerObserver({ namespace, observer }: RegisterObserverRequest): void;
}
