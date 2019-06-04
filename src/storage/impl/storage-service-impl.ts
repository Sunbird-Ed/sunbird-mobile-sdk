import {StorageDestination, StorageEventType, StorageService, StorageTransferProgress} from '..';
import {Observable} from 'rxjs';
import {Content} from '../../content';
import {inject, injectable} from 'inversify';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {InjectionTokens} from '../../injection-tokens';
import {EmitRequest} from '../../events-bus/def/emit-request';
import {StorageKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';

@injectable()
export class StorageServiceImpl implements StorageService {
    private static readonly STORAGE_DESTINATION = StorageKeys.STORAGE_DESTINATION;

    constructor(@inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences) {
    }

    getStorageDestination(): Observable<StorageDestination> {
        return this.sharedPreferences.getString(StorageServiceImpl.STORAGE_DESTINATION)
            .map((r) => {
                if (!r) {
                    return StorageDestination.INTERNAL_STORAGE;
                }

                return r as StorageDestination;
            });
    }

    transferContents(storageDestination: StorageDestination, contents: Content[]): Observable<undefined> {
        // TODO
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
        // TODO
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
        // TODO
    }
}
