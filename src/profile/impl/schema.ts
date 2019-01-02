import {Constant} from '../def/constant';
import {Migration} from '../../db';

class ProfileEntry {

    static readonly _ID = '_id';
    static readonly TABLE_NAME = 'profiles';

    static createTable(): string {
        return `CREATE TABLE ${this.TABLE_NAME} (
            ${this._ID} INTEGER PRIMARY KEY,
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
    }

    static deleteTable(): string {
        return 'DROP TABLE IF EXISTS ' + ProfileEntry.TABLE_NAME;
    }

}

export class ProfileEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [ProfileEntry.createTable()];
    }
}
