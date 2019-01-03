import {Constant, Migration} from '../../db';

export class TelemetryEntry {

    static readonly _ID = '_id';
    static readonly TABLE_NAME = 'telemetry';
    static readonly COLUMN_NAME_EVENT_TYPE = 'event_type';
    static readonly COLUMN_NAME_EVENT = 'event';
    static readonly COLUMN_NAME_TIMESTAMP = 'timestamp';
    static readonly COLUMN_NAME_PRIORITY = 'priority';

    static getCreateEntry(): string {
        return 'CREATE TABLE ' + TelemetryEntry.TABLE_NAME + ' (' +
            TelemetryEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryEntry.COLUMN_NAME_EVENT_TYPE + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_EVENT + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_TIMESTAMP + Constant.INT_TYPE + Constant.COMMA_SEP +
            TelemetryEntry.COLUMN_NAME_PRIORITY + Constant.INT_TYPE +
            ' )';
    }

    static getDeleteEntry(): string {
        return 'DROP TABLE IF EXISTS ' + TelemetryEntry.TABLE_NAME;
    }

}


export class TelemetryProcessedEntry {

    static readonly _ID = '_id';
    static readonly TABLE_NAME = 'processed_telemetry';
    static readonly COLUMN_NAME_MSG_ID = 'msg_id';
    static readonly COLUMN_NAME_DATA = 'data';
    static readonly COLUMN_NAME_NUMBER_OF_EVENTS = 'event_count';
    static readonly COLUMN_NAME_PRIORITY = 'priority';

    static getCreateEntry(): string {
        return 'CREATE TABLE ' + TelemetryProcessedEntry.TABLE_NAME + ' (' +
            TelemetryProcessedEntry._ID + ' INTEGER PRIMARY KEY,' +
            TelemetryProcessedEntry.COLUMN_NAME_MSG_ID + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_DATA + Constant.TEXT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + Constant.INT_TYPE + Constant.COMMA_SEP +
            TelemetryProcessedEntry.COLUMN_NAME_PRIORITY + Constant.INT_TYPE +
            ' )';
    }

    static getDeleteEntry() {
        return 'DROP TABLE IF EXISTS ' + TelemetryProcessedEntry.TABLE_NAME;
    }
}

export class TelemetryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [TelemetryEntry.getCreateEntry(), TelemetryProcessedEntry.getCreateEntry()];
    }

}
