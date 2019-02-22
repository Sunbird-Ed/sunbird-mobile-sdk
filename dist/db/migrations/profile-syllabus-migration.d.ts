import { DbService, Migration } from '..';
export declare class ProfileSyllabusMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
