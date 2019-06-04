import {EventsBusEvent} from '../../events-bus';

export interface StorageEvent extends EventsBusEvent {
    type: StorageEventType;
}

export interface StorageTransferProgress extends StorageEvent {
    payload: {
        progress: {transferSize: number, totalSize: number};
    };
}

export enum StorageEventType {
    TRANSFER_PROGRESS = 'TRANSFER_PROGRESS',
    TRANSFER_COMPLETED = 'TRANSFER_COMPLETED',
    TRANSFER_REVERT_COMPLETED = 'TRANSFER_REVERT_COMPLETED',
}
