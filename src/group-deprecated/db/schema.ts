import {DbConstants} from '../../db';

export namespace GroupProfileEntry {

    export const TABLE_NAME = 'group_profile';
    export const _ID = '_id';
    export const COLUMN_NAME_UID = 'uid';
    export const COLUMN_NAME_GID = 'gid';
    export const COLUMN_NAME_EPOCH_TIMESTAMP = 'epoch_timestamp';

    export interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_GID]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + GroupProfileEntry.TABLE_NAME + ' (' +
            GroupProfileEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            COLUMN_NAME_GID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_UID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EPOCH_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            'UNIQUE (' + COLUMN_NAME_GID + DbConstants.COMMA_SEP + COLUMN_NAME_UID + ') ON CONFLICT REPLACE' +
            ')';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + GroupProfileEntry.TABLE_NAME;

    };
}

export namespace GroupEntry {

    export const TABLE_NAME = 'groups';
    export const _ID = '_id';
    export const COLUMN_NAME_GID = 'gid';
    export const COLUMN_NAME_NAME = 'name';
    export const COLUMN_NAME_SYLLABUS = 'syllabus';
    export const COLUMN_NAME_GRADE = 'grade';
    export const COLUMN_NAME_GRADE_VALUE = 'grade_value';
    export const COLUMN_NAME_CREATED_AT = 'created_at';
    export const COLUMN_NAME_UPDATED_AT = 'updated_at';

    export interface SchemaMap {
        [COLUMN_NAME_GID]: string;
        [COLUMN_NAME_NAME]: string;
        [COLUMN_NAME_SYLLABUS]: string;
        [COLUMN_NAME_GRADE]: string;
        [COLUMN_NAME_GRADE_VALUE]: string;
        [COLUMN_NAME_CREATED_AT]: number;
        [COLUMN_NAME_UPDATED_AT]: number;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + GroupEntry.TABLE_NAME + ' (' +
            GroupEntry._ID + ' INTEGER PRIMARY KEY' + DbConstants.COMMA_SEP +
            COLUMN_NAME_GID + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_NAME + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_SYLLABUS + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' DEFAULT ""' + DbConstants.COMMA_SEP +
            COLUMN_NAME_GRADE + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' DEFAULT ""' + DbConstants.COMMA_SEP +
            COLUMN_NAME_GRADE_VALUE + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' DEFAULT ""' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CREATED_AT + ' INTEGER' + DbConstants.COMMA_SEP +
            COLUMN_NAME_UPDATED_AT + ' INTEGER' + ' )';
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + GroupEntry.TABLE_NAME;
    };

}

