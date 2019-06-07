import {StorageDestination, StorageEventType, StorageTransferProgress} from '..';
import {Content} from '../../content';
import {Observable} from 'rxjs';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {EmitRequest} from '../../events-bus/def/emit-request';

export class TransferContentHandler {
    handle(storageDestination: StorageDestination, content: Content, eventsBusService: EventsBusService): Observable<undefined> {
        // TODO: Swayangjit
        const events: EmitRequest<any>[] = [
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_PROGRESS,
                    payload: {
                        progress: {
                            transferSize: 1,
                            totalSize: 10
                        }
                    }
                } as StorageTransferProgress
            },
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_PROGRESS,
                    payload: {
                        progress: {
                            transferSize: 3,
                            totalSize: 10
                        }
                    }
                } as StorageTransferProgress
            },
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_PROGRESS,
                    payload: {
                        progress: {
                            transferSize: 8,
                            totalSize: 10
                        }
                    }
                } as StorageTransferProgress
            },
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_PROGRESS,
                    payload: {
                        progress: {
                            transferSize: 10,
                            totalSize: 10
                        }
                    }
                } as StorageTransferProgress
            }
        ];

        return Observable
            .from(events)
            .delay(1000)
            .do((e) => {
                eventsBusService.emit(e);
            })
            .mapTo(undefined);
    }
}
