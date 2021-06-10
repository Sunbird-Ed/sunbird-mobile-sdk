import { DbService, Migration } from '..';
export declare class ContentGeneralizationMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    private updateContentTable;
    private buildPrimaryCategoryCases;
    queries(): Array<string>;
}
