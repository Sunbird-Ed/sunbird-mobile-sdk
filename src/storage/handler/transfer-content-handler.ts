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
                            transferSize: 1000,
                            totalSize: 10000
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
                            transferSize: 3000,
                            totalSize: 10000
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
                            transferSize: 8000,
                            totalSize: 10000
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
                            transferSize: 10000,
                            totalSize: 10000
                        }
                    }
                } as StorageTransferProgress
            }
        ];

        return Observable.zip(
            Observable.from(events),
            Observable.interval(1000).take(events.length)
        )
        .map((r) => r[0])
            .map((r) => {
                if (r.event.payload.progress.transferSize === 8000) {
                    throw new Error('Some Error');
                }

                return r;
            })
        .do((e) => {
            eventsBusService.emit(e);
        })
        .mapTo(undefined);
    }
}
