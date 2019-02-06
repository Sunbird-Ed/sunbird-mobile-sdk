import {DbConstants} from '../../db';

export namespace KeyValueStoreEntry {

    export const _ID = '_id';
    export const KEY = 'key';
    export const VALUE = 'value';
    export const TABLE_NAME = 'no_sql';

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + '(' +
            KeyValueStoreEntry._ID + DbConstants.SPACE + 'INTEGER PRIMARY KEY,' +
            KeyValueStoreEntry.KEY + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            KeyValueStoreEntry.VALUE + DbConstants.TEXT_TYPE +
            ')';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + KeyValueStoreEntry.TABLE_NAME;

    };
}
