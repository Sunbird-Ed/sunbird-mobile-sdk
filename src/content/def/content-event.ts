import {EventBusEvent} from '../../events-bus/def/event-bus-event';

export interface ContentEvent extends EventBusEvent {
    type: ContentEventType;
}

export interface ContentUpdate extends ContentEvent {
    payload: {
        contentId: string;
    };
}

export interface ContentImportProgress extends ContentEvent {
    payload: {
        currentCount: number;
        totalCount: number;
    };
}

export interface ContentImportCompleted extends ContentEvent {
    payload: {
        contentId: string;
    };
}

export enum ContentEventType {
    UPDATE = 'UPDATE',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED',
    IMPORT_PROGRESS = 'IMPORT_PROGRESS'
}

