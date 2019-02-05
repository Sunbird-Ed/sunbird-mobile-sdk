import { DbService, Migration } from '..';
export declare class MillisecondsToSecondsMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
