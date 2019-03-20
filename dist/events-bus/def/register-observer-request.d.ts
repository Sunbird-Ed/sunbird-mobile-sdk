import { EventNamespace } from './event-namespace';
import { EventObserver } from './event-observer';
export interface RegisterObserverRequest {
    namespace: EventNamespace;
    observer: EventObserver<any>;
}
