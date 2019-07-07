import {Observable} from 'rxjs';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {StorageVolume} from '../../../native/device';
import {StorageDestination} from './storage-destination';
import {Content} from '../../content';
import {TransferContentsRequest} from './storage-requests';

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
