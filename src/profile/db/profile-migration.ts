import {Migration} from '../../db';
import {ProfileEntry, GroupProfileEntry, GroupEntry} from './schema';

export class ProfileEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [ProfileEntry.createTable()];
    }
}

export class GroupProfileEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [GroupProfileEntry.createTable()];
    }
}

export class GroupEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [GroupEntry.createTable()];
    }
}

