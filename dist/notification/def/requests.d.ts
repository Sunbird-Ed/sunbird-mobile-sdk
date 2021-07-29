export interface NotificationFilterCriteria {
    notificationStatus: NotificationStatus;
}
export interface Notification {
    id: number;
    type: number;
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
