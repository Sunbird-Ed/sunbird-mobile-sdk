export declare namespace TelemetryEntry {
    const _ID = "_id";
    const TABLE_NAME = "telemetry";
    const COLUMN_NAME_EVENT_TYPE = "event_type";
    const COLUMN_NAME_EVENT = "event";
    const COLUMN_NAME_TIMESTAMP = "timestamp";
    const COLUMN_NAME_PRIORITY = "priority";
    interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_EVENT_TYPE]: string;
        [COLUMN_NAME_EVENT]: string;
        [COLUMN_NAME_TIMESTAMP]: number;
        [COLUMN_NAME_PRIORITY]: number;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace TelemetryProcessedEntry {
    const _ID = "_id";
    const TABLE_NAME = "processed_telemetry";
    const COLUMN_NAME_MSG_ID = "msg_id";
    const COLUMN_NAME_DATA = "data";
    const COLUMN_NAME_NUMBER_OF_EVENTS = "event_count";
    const COLUMN_NAME_PRIORITY = "priority";
    interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_MSG_ID]: string;
        [COLUMN_NAME_DATA]: string;
        [COLUMN_NAME_NUMBER_OF_EVENTS]: number;
        [COLUMN_NAME_PRIORITY]: number;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace EventPriorityEntry {
    const _ID = "_id";
    const TABLE_NAME = "event_priority";
    const COLUMN_NAME_EVENT = "event";
    const COLUMN_NAME_PRIORITY = "priority";
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace TelemetryTagEntry {
    const _ID = "_id";
    const TABLE_NAME = "telemetry_tags";
    const COLUMN_NAME_NAME = "name";
    const COLUMN_NAME_HASH = "hash";
    const COLUMN_NAME_DESCRIPTION = "description";
    const COLUMN_NAME_START_DATE = "start_date";
    const COLUMN_NAME_END_DATE = "end_date";
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace MetaEntry {
    const _ID = "_id";
    const TABLE_NAME = "meta_data";
    const COLUMN_NAME_MSG_ID = "key";
    const COLUMN_NAME_DATA = "value";
    interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_MSG_ID]: string;
        [COLUMN_NAME_DATA]: string;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
