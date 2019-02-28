import {Observable} from 'rxjs';
import {EventNamespace} from './event-namespace';
import {EmitRequest} from './emit-request';
import {RegisterDelegateRequest} from './register-delegate-request';

export interface EventsBusService {
    events(namespace?: EventNamespace): Observable<any>;

    emit(emitRequest: EmitRequest): void;

    /** @internal */
    registerDelegate(registerDelegateRequest: RegisterDelegateRequest);
}

