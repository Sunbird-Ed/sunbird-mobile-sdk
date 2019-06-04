import {StorageDestination} from './storage-destination';
import {Observable} from 'rxjs';
import {Content} from '../..';

export interface StorageService {
    getStorageDestination(): Observable<StorageDestination>;

    getCurrentlyTransferringContent(): Content | undefined;
    transferContents(storageDestination: StorageDestination, contents: Content[]): Observable<undefined>;
    cancelCurrentTransfer();
    retryCurrentTransfer();
}
