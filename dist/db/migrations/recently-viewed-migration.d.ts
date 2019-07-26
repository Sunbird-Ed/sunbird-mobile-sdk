import { DbService, Migration } from '..';
export declare class RecentlyViewedMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
