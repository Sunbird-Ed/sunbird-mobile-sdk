import {Observable} from 'rxjs';
import {EventNamespace} from './event-namespace';
import {EmitRequest} from './emit-request';
import {RegisterDelegateRequest} from './register-delegate-request';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';

export interface EventsBusService extends SdkServiceOnInitDelegate {
    events(namespace?: EventNamespace): Observable<any>;

    emit(emitRequest: EmitRequest): void;

    /** @internal */
    registerDelegate(registerDelegateRequest: RegisterDelegateRequest);
}

