export declare namespace NotificationEntry {
    const _ID = "_id";
    const TABLE_NAME = "notifications";
    const COLUMN_NAME_MESSAGE_ID = "message_id";
    const COLUMN_NAME_EXPIRY_TIME = "expiry_time";
    const COLUMN_NAME_NOTIFICATION_DISPLAY_TIME = "display_time";
    const COLUMN_NAME_NOTIFICATION_RECEIVED_AT = "received_at";
    const COLUMN_NAME_NOTIFICATION_JSON = "notification_json";
    const COLUMN_NAME_IS_READ = "is_read";
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
