import { Observable } from 'rxjs';
import { EventNamespace } from './event-namespace';
import { EmitRequest } from './emit-request';
import { RegisterObserverRequest } from './register-observer-request';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
import { EventsBusEvent } from './events-bus-event';
export interface EventsBusService extends SdkServiceOnInitDelegate {
    events(namespace?: EventNamespace): Observable<EventsBusEvent>;
    emit(emitRequest: EmitRequest<EventsBusEvent>): void;
    registerObserver(registerDelegateRequest: RegisterObserverRequest): any;
}
