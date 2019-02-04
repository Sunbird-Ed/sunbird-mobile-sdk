import { DbService, Migration } from '..';
export declare class ContentMarkerMigration extends Migration {
    constructor();
    apply(dbService: DbService): void;
    queries(): Array<string>;
}
