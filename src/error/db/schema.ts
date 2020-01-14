import { DbConstants } from '../../db';

export namespace ErrorStackEntry {

    export const TABLE_NAME = 'error_stack';
    export const _ID = '_id';
    export const COLUMN_NAME_APP_VERSION = 'app_version';
    export const COLUMN_NAME_PAGE_ID = 'page_id';
    export const COLUMN_NAME_TIME_STAMP = 'time_stamp';
    export const COLUMN_NAME_ERROR_LOG = 'error_log';

    export interface SchemaMap {
        [_ID]?: string;
        [COLUMN_NAME_APP_VERSION]: string;
        [COLUMN_NAME_PAGE_ID]: string;
        [COLUMN_NAME_TIME_STAMP]: number;
        [COLUMN_NAME_ERROR_LOG]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + ErrorStackEntry.TABLE_NAME + ' (' +
            ErrorStackEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_APP_VERSION + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_PAGE_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_TIME_STAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_ERROR_LOG + DbConstants.SPACE + DbConstants.TEXT_TYPE +
            ' )';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + ErrorStackEntry.TABLE_NAME;
    };
}
