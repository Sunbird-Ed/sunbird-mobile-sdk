import { DbConstants } from '../../db';

export namespace ErrorStackEntry {

    export const TABLE_NAME = 'error_stack';
    export const _ID = '_id';
    export const COLUMN_NAME_APP_VERSION = 'app_version';
    export const COLUMN_NAME_STACK_TRACE = 'stack_trace';
    export const COLUMN_NAME_PAGE_ID = 'page_id';
    export const COLUMN_NAME_ERROR_TYPE = 'error_type';

    export interface SchemaMap {
        [COLUMN_NAME_APP_VERSION]: string;
        [COLUMN_NAME_STACK_TRACE]: string;
        [COLUMN_NAME_PAGE_ID]: string;
        [COLUMN_NAME_ERROR_TYPE]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + ErrorStackEntry.TABLE_NAME + ' (' +
            ErrorStackEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_APP_VERSION + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_STACK_TRACE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_PAGE_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            ErrorStackEntry.COLUMN_NAME_ERROR_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE +
            ' )';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + ErrorStackEntry.TABLE_NAME;

    };
}
