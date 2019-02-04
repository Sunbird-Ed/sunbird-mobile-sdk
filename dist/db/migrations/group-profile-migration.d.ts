import { DbService, Migration } from '..';
export declare class GroupProfileMigration extends Migration {
    constructor();
    apply(dbService: DbService): void;
    queries(): Array<string>;
    private updateProfileTable;
}
