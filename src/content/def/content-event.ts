export interface ContentEvent {
    type: ContentEventType;
    contentId: string;
}

export interface ContentImportProgress {
    type: ContentEventType;
    currentCount: number;
    totalCount: number;
}

export enum ContentEventType {
    UPDATE = 'UPDATE',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED',
    IMPORT_PROGRESS = 'IMPORT_PROGRESS'
}

