import { DbService, Migration } from '..';
export declare class CourseAssessmentMigration extends Migration {
    constructor();
    apply(dbService: DbService): Promise<undefined>;
    queries(): Array<string>;
}
