export declare namespace SearchHistoryEntry {
    const TABLE_NAME = "search_history";
    const _ID = "_id";
    const COLUMN_NAME_USER_ID = "uid";
    const COLUMN_NAME_QUERY = "query";
    const COLUMN_NAME_TIME_STAMP = "time_stamp";
    const COLUMN_NAME_NAMESPACE = "namespace";
    interface SchemaMap {
        [_ID]?: string;
        [COLUMN_NAME_USER_ID]: string;
        [COLUMN_NAME_QUERY]: string;
        [COLUMN_NAME_TIME_STAMP]: number;
        [COLUMN_NAME_NAMESPACE]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
