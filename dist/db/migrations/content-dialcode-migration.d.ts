import { DbService, Migration } from '..';
export declare class ContentDialcodeMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
    private updateEntries;
    private buildDialcodesCases;
    private buildChildNodesCases;
}
