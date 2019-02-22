export declare namespace KeyValueStoreEntry {
    const _ID = "_id";
    const TABLE_NAME = "no_sql";
    const COLUMN_NAME_KEY = "key";
    const COLUMN_NAME_VALUE = "value";
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
    interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_KEY]: string;
        [COLUMN_NAME_VALUE]: string;
    }
}
