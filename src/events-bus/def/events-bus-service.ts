import {Observable} from 'rxjs';
import {EventNamespace} from './event-namespace';
import {EmitRequest} from './emit-request';
import {RegisterObserverRequest} from './register-observer-request';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {DownloadProgress} from '../../util/download';
import {ContentEvent, ImportProgress} from '../../content';

export type EventBusEvent = DownloadProgress | ContentEvent | ImportProgress;

export interface EventsBusService extends SdkServiceOnInitDelegate {
    events(namespace?: EventNamespace): Observable<EventBusEvent>;

    emit(emitRequest: EmitRequest<EventBusEvent>): void;

    registerObserver(registerDelegateRequest: RegisterObserverRequest);
}

