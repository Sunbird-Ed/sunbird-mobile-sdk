export declare namespace ErrorStackEntry {
    const TABLE_NAME = "error_stack";
    const _ID = "_id";
    const COLUMN_NAME_APP_VERSION = "app_version";
    const COLUMN_NAME_PAGE_ID = "page_id";
    const COLUMN_NAME_TIME_STAMP = "time_stamp";
    const COLUMN_NAME_ERROR_LOG = "error_log";
    interface SchemaMap {
        [_ID]?: string;
        [COLUMN_NAME_APP_VERSION]: string;
        [COLUMN_NAME_PAGE_ID]: string;
        [COLUMN_NAME_TIME_STAMP]: number;
        [COLUMN_NAME_ERROR_LOG]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
