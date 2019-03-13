export interface ContentEvent {
    type: ContentEventType;
    event: any;
}

export enum ContentEventType {
    UPDATE = 'UPDATE'
}

