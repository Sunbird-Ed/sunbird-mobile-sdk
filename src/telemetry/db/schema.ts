import {DbConstants} from '../../db';

export namespace TelemetryEntry {
    export const _ID = '_id';
    export const TABLE_NAME = 'telemetry';
    export const COLUMN_NAME_EVENT_TYPE = 'event_type';
    export const COLUMN_NAME_EVENT = 'event';
    export const COLUMN_NAME_TIMESTAMP = 'timestamp';
    export const COLUMN_NAME_PRIORITY = 'priority';

    export interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_EVENT_TYPE]: string;
        [COLUMN_NAME_EVENT]: string;
        [COLUMN_NAME_TIMESTAMP]: number;
        [COLUMN_NAME_PRIORITY]: number;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TelemetryEntry.TABLE_NAME + ' (' +
            TelemetryEntry._ID + DbConstants.SPACE + ' INTEGER PRIMARY KEY,' +
            TelemetryEntry.COLUMN_NAME_EVENT_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_EVENT + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_PRIORITY + DbConstants.SPACE + DbConstants.INT_TYPE +
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

    export interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_MSG_ID]: string;
        [COLUMN_NAME_DATA]: string;
        [COLUMN_NAME_NUMBER_OF_EVENTS]: number;
        [COLUMN_NAME_PRIORITY]: number;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TelemetryProcessedEntry.TABLE_NAME + ' (' +
            TelemetryProcessedEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryProcessedEntry.COLUMN_NAME_MSG_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_PRIORITY + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TelemetryProcessedEntry.TABLE_NAME;
    };
}

export namespace EventPriorityEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'event_priority';
    export const COLUMN_NAME_EVENT = 'event';
    export const COLUMN_NAME_PRIORITY = 'priority';


    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + EventPriorityEntry.TABLE_NAME + ' (' +
            EventPriorityEntry._ID + ' INTEGER PRIMARY KEY,' +
            EventPriorityEntry.COLUMN_NAME_EVENT + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            EventPriorityEntry.COLUMN_NAME_PRIORITY + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + EventPriorityEntry.TABLE_NAME;
    };
}

export namespace TelemetryTagEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'telemetry_tags';
    export const COLUMN_NAME_NAME = 'name';
    export const COLUMN_NAME_HASH = 'hash';
    export const COLUMN_NAME_DESCRIPTION = 'description';
    export const COLUMN_NAME_START_DATE = 'start_date';
    export const COLUMN_NAME_END_DATE = 'end_date';


    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_NAME + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_HASH + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_DESCRIPTION + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_START_DATE + DbConstants.SPACE + DbConstants.DATE_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_END_DATE + DbConstants.SPACE + DbConstants.DATE_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

}

export namespace MetaEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'meta_data';
    export const COLUMN_NAME_MSG_ID = 'key';
    export const COLUMN_NAME_DATA = 'value';

    export interface SchemaMap {
        [_ID]: string;
        [COLUMN_NAME_MSG_ID]: string;
        [COLUMN_NAME_DATA]: string;
    }
    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE ' + MetaEntry.TABLE_NAME + ' (' +
            MetaEntry._ID + ' INTEGER PRIMARY KEY,' +
            MetaEntry.COLUMN_NAME_MSG_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            MetaEntry.COLUMN_NAME_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + MetaEntry.TABLE_NAME;
    };
}
