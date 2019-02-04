import { DbService, Migration } from '..';
export declare class InitialMigration extends Migration {
    constructor();
    apply(dbService: DbService): void;
    queries(): Array<string>;
}
