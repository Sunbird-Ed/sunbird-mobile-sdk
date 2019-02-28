import {DbService, Migration} from '..';
import {LearnerAssessmentSummary} from '../../summarizer/def/response';
import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry} from '../../profile/db/schema';
import {SummarizerHandler} from '../../summarizer/handler/summarizer-handler';
import {ProfileMapper} from '../../profile/util/profile-mapper';

export class MillisecondsToSecondsMigration extends Migration {

    constructor() {
        super(4, 19);
    }

    public async apply(dbService: DbService) {
        await dbService.read({
            table: LearnerAssessmentsEntry.TABLE_NAME,
            columns: []
        }).map((rows: LearnerSummaryEntry.SchemaMap[]) => {
            rows.forEach(async (row: LearnerSummaryEntry.SchemaMap) => {
                const total = Number(row[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS]);
                row[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS] = Math.round(total / 1000);
                await dbService.update({
                    table: LearnerSummaryEntry.TABLE_NAME,
                    modelJson: row
                }).toPromise();
            });
        }).toPromise();

        return undefined;
    }

    queries(): Array<string> {
        return [];
    }

}
