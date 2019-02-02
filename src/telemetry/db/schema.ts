import {DbConstants} from '../../db';

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
            TelemetryEntry.COLUMN_NAME_EVENT_TYPE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_EVENT + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_TIMESTAMP + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_PRIORITY + DbConstants.INT_TYPE +
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
            TelemetryProcessedEntry.COLUMN_NAME_MSG_ID + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_DATA + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_PRIORITY + DbConstants.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TelemetryProcessedEntry.TABLE_NAME;
    };
}

export namespace EventPriorityEntry  {

    export const _ID = '_id';
    export const TABLE_NAME = 'event_priority';
    export const COLUMN_NAME_EVENT = 'event';
    export const COLUMN_NAME_PRIORITY = 'priority';


    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE ' + EventPriorityEntry.TABLE_NAME + ' (' +
            EventPriorityEntry._ID + ' INTEGER PRIMARY KEY,' +
            EventPriorityEntry.COLUMN_NAME_EVENT + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            EventPriorityEntry.COLUMN_NAME_PRIORITY + DbConstants.INT_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + EventPriorityEntry.TABLE_NAME;
    };
}

export namespace TelemetryTagEntry  {

    export const _ID = '_id';
    export const TABLE_NAME = 'telemetry_tags';
    export const COLUMN_NAME_NAME = 'name';
    export const COLUMN_NAME_HASH = 'hash';
    export const COLUMN_NAME_DESCRIPTION = 'description';
    export const COLUMN_NAME_START_DATE = 'start_date';
    export const COLUMN_NAME_END_DATE = 'end_date';



    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE ' + EventPriorityEntry.TABLE_NAME + ' (' +
            TelemetryTagEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryTagEntry.COLUMN_NAME_NAME + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryTagEntry.COLUMN_NAME_HASH + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryTagEntry.COLUMN_NAME_DESCRIPTION + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            TelemetryTagEntry.COLUMN_NAME_START_DATE + DbConstants.DATE_TYPE + DbConstants.COMMA_SEP +
            TelemetryTagEntry.COLUMN_NAME_END_DATE + DbConstants.DATE_TYPE +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TelemetryTagEntry.TABLE_NAME;
    };
}
