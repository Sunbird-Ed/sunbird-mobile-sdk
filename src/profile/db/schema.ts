import {Constant} from '../def/constant';

export namespace ProfileEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'profiles';

    export const createTable: (() => string) = () => {
        return `CREATE TABLE ${TABLE_NAME} (
            ${_ID} INTEGER PRIMARY KEY,
            ${Constant.UID} TEXT,
            ${Constant.HANDLE} TEXT,
            ${Constant.CREATED_AT} INTEGER,
            ${Constant.MEDIUM} TEXT DEFAULT '',
            ${Constant.BOARD} TEXT DEFAULT '',
            ${Constant.SUBJECT} TEXT DEFAULT '',
            ${Constant.PROFILE_TYPE} TEXT DEFAULT 'teacher',
            ${Constant.GRADE} TEXT DEFAULT '',
            ${Constant.SYLLABUS} TEXT DEFAULT '',
            ${Constant.SOURCE} TEXT DEFAULT '',
            ${Constant.GRADE_VALUE} TEXT DEFAULT '')`;
    };
    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + ProfileEntry.TABLE_NAME;

    };
}

