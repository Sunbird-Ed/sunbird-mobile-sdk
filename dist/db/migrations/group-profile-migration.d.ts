import { DbService, Migration } from '..';
export declare class GroupProfileMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
    private updateProfileTable;
}
