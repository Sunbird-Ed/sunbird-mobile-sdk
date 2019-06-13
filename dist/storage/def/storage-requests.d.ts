import { StorageDestination } from './storage-destination';
import { Content } from '../../content';
export interface TransferContentsRequest {
    storageDestination: StorageDestination;
    contents: Content[];
}
