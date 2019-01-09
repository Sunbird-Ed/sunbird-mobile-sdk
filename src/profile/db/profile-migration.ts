import {Migration} from '../../db';
import {ProfileEntry, GroupProfileEntry, GroupEntry} from './schema';

export class ProfileEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [ProfileEntry.createTable()];
    }

    groupProfileQueries(): Array<string> {
        return [GroupProfileEntry.createTable()];
    }

    groupQueries(): Array<string> {
        return [GroupEntry.createTable()];
    }

}
