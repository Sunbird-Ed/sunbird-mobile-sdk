export namespace KeyValueStoreEntry {

    export const _ID = '_id';
    export const KEY = 'key';
    export const VALUE = 'value';
    export const TABLE_NAME = 'no_sql';

    export const createTable: (() => string) = () => {
        return `CREATE TABLE ${TABLE_NAME} (${_ID} INTEGER PRIMARY KEY,${KEY} TEXT, ${VALUE} TEXT )`;
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + KeyValueStoreEntry.TABLE_NAME;

    };
}