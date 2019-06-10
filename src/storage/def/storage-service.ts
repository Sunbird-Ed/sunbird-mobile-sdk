import {StorageDestination} from './storage-destination';
import {Observable} from 'rxjs';
import {Content, StorageVolume} from '../..';
import {TransferContentsRequest} from './storage-requests';

export interface StorageService {
    getStorageDestinationVolumeInfo(): Observable<StorageVolume>;

    getStorageDestination(): Observable<StorageDestination>;

    getToTransferContents(): Observable<Content[]>;

    getTransferringContent(): Observable<Content | undefined>;

    transferContents(transferContentsRequest: TransferContentsRequest): Observable<undefined>;

    cancelTransfer(): Observable<undefined>;

    retryCurrentTransfer(): Observable<undefined>;
}
