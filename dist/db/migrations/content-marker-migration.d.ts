import { DbService, Migration } from '..';
export declare class ContentMarkerMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
