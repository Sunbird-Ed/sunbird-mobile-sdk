export declare namespace ErrorStackEntry {
    const TABLE_NAME = "error_stack";
    const _ID = "_id";
    const COLUMN_NAME_APP_VERSION = "app_version";
    const COLUMN_NAME_STACK_TRACE = "stack_trace";
    const COLUMN_NAME_PAGE_ID = "page_id";
    const COLUMN_NAME_ERROR_TYPE = "error_type";
    interface SchemaMap {
        [COLUMN_NAME_APP_VERSION]: string;
        [COLUMN_NAME_STACK_TRACE]: string;
        [COLUMN_NAME_PAGE_ID]: string;
        [COLUMN_NAME_ERROR_TYPE]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
