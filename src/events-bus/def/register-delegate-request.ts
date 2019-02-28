import {EventNamespace} from './event-namespace';
import {EventDelegate} from './event-delegate';

export interface RegisterDelegateRequest {
    namespace: EventNamespace;
    delegate: EventDelegate;
}
