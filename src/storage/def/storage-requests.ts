import {Content} from '../../content';
import {StorageVolume} from '../../util/device';

export enum ExistingContentAction {
    IGNORE = 'IGNORE',
    KEEP_HIGER_VERSION = 'KEEP_HIGER_VERSION',
    KEEP_LOWER_VERSION = 'KEEP_LOWER_VERSION',
    KEEP_SOURCE = 'KEEP_SOURCE',
    KEEP_DESTINATION = 'KEEP_DESTINATION'
}

export interface TransferContentsRequest {
    contents: Pick<Content, 'identifier'>[];
    duplicateContentAction: ExistingContentAction;
    storageDestinationVolume: StorageVolume;
    deleteDestinationFolder: boolean;
}
