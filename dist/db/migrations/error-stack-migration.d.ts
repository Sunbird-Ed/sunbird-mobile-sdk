import { DbService, Migration } from '..';
export declare class ErrorStackMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
