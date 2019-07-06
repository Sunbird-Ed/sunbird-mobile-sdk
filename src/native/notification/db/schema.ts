import {DbConstants} from '../../db';

export namespace NotificationEntry {
    export const _ID = '_id';
    export const TABLE_NAME = 'notifications';
    export const COLUMN_NAME_MESSAGE_ID = 'message_id';
    export const COLUMN_NAME_EXPIRY_TIME = 'expiry_time';
    export const COLUMN_NAME_NOTIFICATION_DISPLAY_TIME = 'display_time';
    export const COLUMN_NAME_NOTIFICATION_RECEIVED_AT = 'received_at';
    export const COLUMN_NAME_NOTIFICATION_JSON = 'notification_json';
    export const COLUMN_NAME_IS_READ = 'is_read';
    export interface SchemaMap {
        [COLUMN_NAME_MESSAGE_ID]: number;
        [COLUMN_NAME_EXPIRY_TIME]: number;
        [COLUMN_NAME_EXPIRY_TIME]: number;
        [COLUMN_NAME_NOTIFICATION_DISPLAY_TIME]: number;
        [COLUMN_NAME_NOTIFICATION_RECEIVED_AT]?: number;
        [COLUMN_NAME_NOTIFICATION_JSON]?: string;
        [COLUMN_NAME_IS_READ]?: number;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_MESSAGE_ID + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EXPIRY_TIME + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_NOTIFICATION_DISPLAY_TIME + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_NOTIFICATION_RECEIVED_AT + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_NOTIFICATION_JSON + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_IS_READ + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;

    };
}
