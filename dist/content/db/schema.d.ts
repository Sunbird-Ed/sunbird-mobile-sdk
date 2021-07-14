export declare namespace ContentEntry {
    const TABLE_NAME = "content";
    const _ID = "_id";
    const COLUMN_NAME_IDENTIFIER = "identifier";
    const COLUMN_NAME_SERVER_DATA = "server_data";
    const COLUMN_NAME_LOCAL_DATA = "local_data";
    const COLUMN_NAME_MIME_TYPE = "mime_type";
    const COLUMN_NAME_PATH = "path";
    const COLUMN_NAME_INDEX = "search_index";
    const COLUMN_NAME_VISIBILITY = "visibility";
    const COLUMN_NAME_SERVER_LAST_UPDATED_ON = "server_last_updated_on";
    const COLUMN_NAME_LOCAL_LAST_UPDATED_ON = "local_last_updated_on";
    const COLUMN_NAME_MANIFEST_VERSION = "manifest_version";
    const COLUMN_NAME_REF_COUNT = "ref_count";
    const COLUMN_NAME_CONTENT_STATE = "content_state";
    const COLUMN_NAME_CONTENT_TYPE = "content_type";
    const COLUMN_NAME_AUDIENCE = "audience";
    const COLUMN_NAME_PRAGMA = "pragma";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_SIZE_ON_DEVICE = "size_on_device";
    const COLUMN_NAME_BOARD = "board";
    const COLUMN_NAME_MEDIUM = "medium";
    const COLUMN_NAME_GRADE = "grade";
    const COLUMN_NAME_DIALCODES = "dialcodes";
    const COLUMN_NAME_CHILD_NODES = "child_nodes";
    const COLUMN_NAME_PRIMARY_CATEGORY = "primary_category";
    interface SchemaMap {
        [COLUMN_NAME_IDENTIFIER]: string;
        [COLUMN_NAME_SERVER_DATA]: string;
        [COLUMN_NAME_LOCAL_DATA]: string;
        [COLUMN_NAME_MIME_TYPE]: string;
        [COLUMN_NAME_PATH]?: string;
        [COLUMN_NAME_INDEX]?: string;
        [COLUMN_NAME_VISIBILITY]?: string;
        [COLUMN_NAME_SERVER_LAST_UPDATED_ON]?: string;
        [COLUMN_NAME_LOCAL_LAST_UPDATED_ON]?: string;
        [COLUMN_NAME_MANIFEST_VERSION]: string;
        [COLUMN_NAME_REF_COUNT]?: number;
        [COLUMN_NAME_CONTENT_STATE]?: number;
        [COLUMN_NAME_CONTENT_TYPE]: string;
        [COLUMN_NAME_AUDIENCE]?: string;
        [COLUMN_NAME_PRAGMA]?: string;
        [COLUMN_NAME_SIZE_ON_DEVICE]?: number;
        [COLUMN_NAME_BOARD]?: string;
        [COLUMN_NAME_MEDIUM]?: string;
        [COLUMN_NAME_GRADE]?: string;
        [COLUMN_NAME_DIALCODES]?: string;
        [COLUMN_NAME_CHILD_NODES]?: string;
        [COLUMN_NAME_PRIMARY_CATEGORY]: string;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
    const getAlterEntryForContentSize: (() => string);
    const getAlterEntryForPragma: (() => string);
    const getAlterEntryForBoard: (() => string);
    const getAlterEntryForMedium: (() => string);
    const getAlterEntryForGrade: (() => string);
    const getAlterEntryForDialCode: (() => string);
    const getAlterEntryForChildNodes: (() => string);
    const getAlterEntryForPrimaryCategory: (() => string);
}
export declare namespace ContentAccessEntry {
    const _ID = "_id";
    const TABLE_NAME = "content_access";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_CONTENT_IDENTIFIER = "identifier";
    const COLUMN_NAME_EPOCH_TIMESTAMP = "epoch_timestamp";
    const COLUMN_NAME_STATUS = "status";
    const COLUMN_NAME_CONTENT_TYPE = "content_type";
    const COLUMN_NAME_LEARNER_STATE = "learner_state";
    const COLUMN_NAME_PRIMARY_CATEGORY = "primary_category";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_IDENTIFIER]: string;
        [COLUMN_NAME_EPOCH_TIMESTAMP]: number;
        [COLUMN_NAME_STATUS]: number;
        [COLUMN_NAME_CONTENT_TYPE]: string;
        [COLUMN_NAME_LEARNER_STATE]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
    const getAlterEntryForPrimaryCategory: (() => string);
}
export declare namespace ContentFeedbackEntry {
    const _ID = "_id";
    const TABLE_NAME = "feedback";
    const COLUMN_NAME_CONTENT_ID = "identifier";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_RATING = "rating";
    const COLUMN_NAME_COMMENTS = "comments";
    const COLUMN_NAME_CREATED_AT = "createdAt";
    interface SchemaMap {
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_RATING]: number;
        [COLUMN_NAME_COMMENTS]: string;
        [COLUMN_NAME_CREATED_AT]: number;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
export declare namespace ContentMarkerEntry {
    const _ID = "_id";
    const TABLE_NAME = "content_marker";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_CONTENT_IDENTIFIER = "identifier";
    const COLUMN_NAME_EPOCH_TIMESTAMP = "epoch_timestamp";
    const COLUMN_NAME_DATA = "data";
    const COLUMN_NAME_EXTRA_INFO = "extra_info";
    const COLUMN_NAME_MARKER = "marker";
    const COLUMN_NAME_MIME_TYPE = "mime_type";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_IDENTIFIER]: string;
        [COLUMN_NAME_EPOCH_TIMESTAMP]: number;
        [COLUMN_NAME_DATA]: string;
        [COLUMN_NAME_EXTRA_INFO]: string;
        [COLUMN_NAME_MARKER]: number;
        [COLUMN_NAME_MIME_TYPE]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
    const getAlterEntryForMimeType: (() => string);
}
