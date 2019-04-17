import { DbService, Migration } from '..';
export declare class OfflineSearchTextbookMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
