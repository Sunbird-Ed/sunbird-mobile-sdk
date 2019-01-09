import { ProfileConstant, GroupProfileConstant, GroupsConstant } from '../def/constant';

export namespace ProfileEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'profiles';

    export const createTable: (() => string) = () => {
        return `CREATE TABLE ${TABLE_NAME} (
            ${_ID} INTEGER PRIMARY KEY,
            ${ProfileConstant.UID} TEXT,
            ${ProfileConstant.HANDLE} TEXT,
            ${ProfileConstant.CREATED_AT} INTEGER,
            ${ProfileConstant.MEDIUM} TEXT DEFAULT '',
            ${ProfileConstant.BOARD} TEXT DEFAULT '',
            ${ProfileConstant.SUBJECT} TEXT DEFAULT '',
            ${ProfileConstant.PROFILE_TYPE} TEXT DEFAULT 'teacher',
            ${ProfileConstant.GRADE} TEXT DEFAULT '',
            ${ProfileConstant.SYLLABUS} TEXT DEFAULT '',
            ${ProfileConstant.SOURCE} TEXT DEFAULT '',
            ${ProfileConstant.GRADE_VALUE} TEXT DEFAULT '')`;
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + ProfileEntry.TABLE_NAME;

    };
}

export namespace GroupProfileEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'group_profile';

    export const createTable: (() => string) = () => {
        return `CREATE TABLE ${TABLE_NAME} (
            ${_ID} INTEGER PRIMARY KEY,
            ${GroupProfileConstant.UID} TEXT,
            ${GroupProfileConstant.GID} TEXT )`;
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + GroupProfileEntry.TABLE_NAME;

    };
}

export namespace GroupEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'groups';

    export const createTable: (() => string) = () => {
        return `CREATE TABLE ${TABLE_NAME} (
            ${_ID} INTEGER PRIMARY KEY,
            ${GroupsConstant.GID} TEXT,
            ${GroupsConstant.NAME} TEXT,
            ${GroupsConstant.SYLLABUS} TEXT DEFAULT '',
            ${GroupsConstant.GRADE} TEXT DEFAULT '',
            ${GroupsConstant.GRADE_VALUE} TEXT DEFAULT '',
            ${GroupsConstant.CREATED_AT}  INTEGER,
            ${GroupsConstant.UPDATED_AT} INTEGER
        )`;
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + GroupEntry.TABLE_NAME;
    };
}



