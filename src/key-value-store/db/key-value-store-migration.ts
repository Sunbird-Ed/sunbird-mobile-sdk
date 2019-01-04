import {Migration} from '../../db';
import {KeyValueStoreEntry} from './schema';

export class KeyValueStoreMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [KeyValueStoreEntry.createTable()];
    }
}