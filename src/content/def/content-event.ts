export interface ContentEvent {
    type: ContentEventType;
    contentId: string;
}

export interface ImportProgress {
    type: ContentEventType;
    currentCount: number;
    totalCount: number;
}

export enum ContentEventType {
    UPDATE = 'UPDATE',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED',
    IMPORT_PROGRESS = 'IMPORT_PROGRESS'
}

