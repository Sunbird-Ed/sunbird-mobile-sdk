import {Migration} from '../../db';
import {ProfileEntry} from './schema';

export class ProfileEntryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [ProfileEntry.createTable()];
    }
}
