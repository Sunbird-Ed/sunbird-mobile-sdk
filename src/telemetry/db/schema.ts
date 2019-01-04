import {Constant} from '../../db';

export namespace TelemetryEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'telemetry';
    export const COLUMN_NAME_EVENT_TYPE = 'event_type';
    export const COLUMN_NAME_EVENT = 'event';
    export const COLUMN_NAME_TIMESTAMP = 'timestamp';
    export const COLUMN_NAME_PRIORITY = 'priority';

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE ' + TelemetryEntry.TABLE_NAME + ' (' +
            TelemetryEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryEntry.COLUMN_NAME_EVENT_TYPE + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_EVENT + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_TIMESTAMP + Constant.INT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_PRIORITY + Constant.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TelemetryEntry.TABLE_NAME;
    };

}


export namespace TelemetryProcessedEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'processed_telemetry';
    export const COLUMN_NAME_MSG_ID = 'msg_id';
    export const COLUMN_NAME_DATA = 'data';
    export const COLUMN_NAME_NUMBER_OF_EVENTS = 'event_count';
    export const COLUMN_NAME_PRIORITY = 'priority';

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE ' + TelemetryProcessedEntry.TABLE_NAME + ' (' +
            TelemetryProcessedEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryProcessedEntry.COLUMN_NAME_MSG_ID + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_DATA + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + Constant.INT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_PRIORITY + Constant.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TelemetryProcessedEntry.TABLE_NAME;
    };
}
