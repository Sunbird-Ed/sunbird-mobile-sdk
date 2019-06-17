import { Notification, NotificationFilterCriteria } from '../def/requests';
import { NotificationEntry } from '../db/schema';
export declare class NotificationHandler {
    static constructNotificationDBModel(notification: Notification): NotificationEntry.SchemaMap;
    static getFilterForNotification(criteria: NotificationFilterCriteria): {
        table: string;
        orderBy: string;
    };
}
