import {EventsBusEvent} from '../../events-bus';

export interface ContentEvent extends EventsBusEvent {
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

export interface ContentExtractCompleted extends ContentEvent {
    payload: {
        contentId: string;
    };
}

export enum ContentEventType {
    UPDATE = 'UPDATE',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED',
    IMPORT_PROGRESS = 'IMPORT_PROGRESS',
    SERVER_CONTENT_DATA = 'SERVER_CONTENT_DATA',
    COURSE_STATE_UPDATED = 'COURSE_STATE_UPDATED',
    CONTENT_EXTRACT_COMPLETED = 'CONTENT_EXTRACT_COMPLETED'
}

