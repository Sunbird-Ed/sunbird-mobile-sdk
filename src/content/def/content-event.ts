export interface ContentEvent {
    type: ContentEventType;
    contentId: string;
}

export enum ContentEventType {
    UPDATE = 'UPDATE'
}

