import {DbService, Migration} from '..';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';

export class CourseAssessmentMigration extends Migration {

    constructor() {
        super(10, 25);
    }

    public async apply(dbService: DbService) {
        for (const query of this.queries()) {
            await dbService.execute(query).toPromise();
        }

        return undefined;
    }

    queries(): Array<string> {
        return [
            CourseAssessmentEntry.getCreateEntry()
        ];
    }
}
