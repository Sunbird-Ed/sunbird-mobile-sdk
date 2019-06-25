import {StorageDestination} from './storage-destination';
import {Observable} from 'rxjs';
import {Content, StorageVolume} from '../..';
import {TransferContentsRequest} from './storage-requests';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';

export interface StorageService extends SdkServiceOnInitDelegate {
    getStorageDestinationDirectoryPath(): string | undefined;

    getStorageDestinationVolumeInfo(): Observable<StorageVolume>;

    getStorageDestination(): Observable<StorageDestination>;

    getToTransferContents(): Observable<Content[]>;

    getTransferringContent(): Observable<Content | undefined>;

    transferContents(transferContentsRequest: TransferContentsRequest): Observable<undefined>;

    scanStorage(): Observable<boolean>;

    cancelTransfer(): Observable<undefined>;

    retryCurrentTransfer(): Observable<undefined>;
}
