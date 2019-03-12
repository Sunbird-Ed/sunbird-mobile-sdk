import {DbConstants} from '../../db';

export namespace KeyValueStoreEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'no_sql';
    export const COLUMN_NAME_KEY = 'key';
    export const COLUMN_NAME_VALUE = 'value';

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_KEY + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_VALUE + DbConstants.SPACE + DbConstants.TEXT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

    export interface SchemaMap {
        [COLUMN_NAME_KEY]: string;
        [COLUMN_NAME_VALUE]: string;
    }
}
