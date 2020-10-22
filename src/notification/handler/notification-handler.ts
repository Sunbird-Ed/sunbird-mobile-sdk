import {Notification, NotificationFilterCriteria, NotificationStatus} from '..';
import {NotificationEntry} from '../db/schema';

export class NotificationHandler {
    public static constructNotificationDBModel(notification: Notification): NotificationEntry.SchemaMap {
        return {
            message_id: notification.id as number,
            expiry_time: notification.expiry,
            display_time: notification.displayTime,
            received_at: Date.now(),
            notification_json: JSON.stringify(notification),
            is_read: notification.isRead
        };
    }

    public static getFilterForNotification(criteria: NotificationFilterCriteria) {
        let selection;
        let selecttionArgs;
        switch (criteria.notificationStatus) {
            case NotificationStatus.ALL :
                selection = `${NotificationEntry.COLUMN_NAME_NOTIFICATION_DISPLAY_TIME} <= ?
                        AND ${NotificationEntry.COLUMN_NAME_EXPIRY_TIME} > ?`;
                selecttionArgs = [Date.now().toString(), Date.now().toString()];
                break;
            case NotificationStatus.UNREAD :
                selection = `${NotificationEntry.COLUMN_NAME_NOTIFICATION_DISPLAY_TIME} <= ?
                        AND ${NotificationEntry.COLUMN_NAME_EXPIRY_TIME} > ? AND
                        AND ${NotificationEntry.COLUMN_NAME_IS_READ} > ?`;
                selecttionArgs = [Date.now().toString(), Date.now().toString(), 0];
                break;
            case NotificationStatus.READ :
            default:
                selection = `${NotificationEntry.COLUMN_NAME_NOTIFICATION_DISPLAY_TIME} <= ?
                        AND ${NotificationEntry.COLUMN_NAME_EXPIRY_TIME} > ?
                        AND ${NotificationEntry.COLUMN_NAME_IS_READ} > ?`;
                selecttionArgs = [Date.now().toString(), Date.now().toString(), 1];
                break;
        }

        return {
            table: NotificationEntry.TABLE_NAME,
            // selection: selection,
            // selectionArgs: selecttionArgs,
            orderBy: `${NotificationEntry.COLUMN_NAME_NOTIFICATION_RECEIVED_AT} desc`
        };

    }
}
