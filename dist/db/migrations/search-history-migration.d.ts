import { DbService, Migration } from '..';
export declare class SearchHistoryMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
