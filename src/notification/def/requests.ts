export interface NotificationFilterCriteria {
    notificationStatus: NotificationStatus;
}

export enum NotificationType {
    USER_FEED = 0,
    ACTIONABLE_NOTIFICATION = 1,
    NOTIFY = 2,
    CONFIG = 3
}

export interface Notification {
    id: number | string;
    type: NotificationType;
    displayTime: number;
    expiry: number;
    isRead: number;
    actionData: ActionData;
}

export interface ActionData {
    actionType: string;
    title: string;
    identifier: string;
    ctaText: string;
    deepLink: string;
    thumbnail: string;
    banner: string;
    deploymentKey: string;
}


export enum NotificationStatus {
    READ = 'read',
    UNREAD = 'unread',
    ALL = 'all'
}
