import { DbService, Migration } from '..';
export declare class ProfileSyllabusMigration extends Migration {
    constructor();
    apply(dbService: DbService): void;
    queries(): Array<string>;
}
