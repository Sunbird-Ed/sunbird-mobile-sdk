import {DbConstants} from '../../../db';

export namespace SearchHistoryEntry {

    export const TABLE_NAME = 'search_history';
    export const _ID = '_id';
    export const COLUMN_NAME_USER_ID = 'uid';
    export const COLUMN_NAME_QUERY = 'query';
    export const COLUMN_NAME_TIME_STAMP = 'time_stamp';
    export const COLUMN_NAME_NAMESPACE = 'namespace';

    export interface SchemaMap {
        [_ID]?: string;
        [COLUMN_NAME_USER_ID]: string;
        [COLUMN_NAME_QUERY]: string;
        [COLUMN_NAME_TIME_STAMP]: number;
        [COLUMN_NAME_NAMESPACE]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + SearchHistoryEntry.TABLE_NAME + ' (' +
            SearchHistoryEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            SearchHistoryEntry.COLUMN_NAME_USER_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            SearchHistoryEntry.COLUMN_NAME_QUERY + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            SearchHistoryEntry.COLUMN_NAME_TIME_STAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            SearchHistoryEntry.COLUMN_NAME_NAMESPACE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            'UNIQUE (' + SearchHistoryEntry.COLUMN_NAME_USER_ID + DbConstants.COMMA_SEP + SearchHistoryEntry.COLUMN_NAME_QUERY + ') ON CONFLICT REPLACE' +
            ' )';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + SearchHistoryEntry.TABLE_NAME;
    };
}
