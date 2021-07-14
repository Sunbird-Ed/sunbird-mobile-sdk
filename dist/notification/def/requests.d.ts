export interface NotificationFilterCriteria {
    notificationStatus: NotificationStatus;
}
export declare enum NotificationType {
    ACTIONABLE_NOTIFICATION = 1,
    NOTIFY = 2,
    CONFIG = 3
}
export interface Notification {
    id: number | string;
    source?: 'FCM' | 'USER_FEED';
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
export declare enum NotificationStatus {
    READ = "read",
    UNREAD = "unread",
    ALL = "all"
}
