import {EventsBusEvent} from '../../events-bus';

export interface StorageEvent extends EventsBusEvent {
    type: StorageEventType;
}

export interface StorageTransferProgress extends StorageEvent {
    type: StorageEventType.TRANSFER_PROGRESS;
    payload: {
        progress: {transferSize: number, totalSize: number};
    };
}

export interface StorageTransferCompleted extends StorageEvent {
    type: StorageEventType.TRANSFER_COMPLETED;
    payload: undefined;
}

export interface StorageTransferRevertCompleted extends StorageEvent {
    type: StorageEventType.TRANSFER_REVERT_COMPLETED;
    payload: undefined;
}

export enum StorageEventType {
    TRANSFER_PROGRESS = 'TRANSFER_PROGRESS',
    TRANSFER_COMPLETED = 'TRANSFER_COMPLETED',
    TRANSFER_REVERT_COMPLETED = 'TRANSFER_REVERT_COMPLETED',
}
