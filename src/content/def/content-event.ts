export interface ContentEvent {
    type: ContentEventType;
    contentId: string;
}

export enum ContentEventType {
    UPDATE = 'UPDATE',
    IMPORT_COMPLETED = 'IMPORT_COMPLETED'
}

