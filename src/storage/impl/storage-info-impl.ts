import { StorageService} from '../def/storage-service';
import { Observable } from 'rxjs';
import { StorageDestination } from '../def/storage-destination';
import { Content } from '../../content';
import { injectable, inject } from 'inversify';
import { EventsBusService, EventNamespace, EventsBusEvent } from '../../events-bus';
import { InjectionTokens } from '../../injection-tokens';
import { StorageTransferProgress, StorageEventType } from '../def/storage-event';
import { EmitRequest } from '../../events-bus/def/emit-request';

@injectable()
export class StorageServiceImpl implements StorageService {
    constructor(@inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService) {}

    getStorageDestination(): Observable<StorageDestination> {
        return Observable.of(StorageDestination.INTERNAL_STORAGE);
    }

    transferContents(storageDestination: StorageDestination, contents: Content[]): Observable<undefined> {
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
            },
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_COMPLETED,
                } as StorageTransferProgress
            },
        ];

        return Observable
            .from(events)
            .delay(1000)
            .do((e) => {
                this.eventsBusService.emit(e);
            })
            .mapTo(undefined);
    }

    cancelCurrentTransfer() {
        const events: EmitRequest<any>[] = [
            {
                namespace: EventNamespace.STORAGE,
                event: {
                    type: StorageEventType.TRANSFER_REVERT_COMPLETED,
                }
            }
        ];

        return Observable
            .from(events)
            .delay(5000)
            .do((e) => {
                this.eventsBusService.emit(e);
            })
            .mapTo(undefined);
    }

    retryCurrentTransfer() {
    }
}
