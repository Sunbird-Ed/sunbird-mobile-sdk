import {DbService, Migration} from '..';
import {LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {map} from 'rxjs/operators';

export class MillisecondsToSecondsMigration extends Migration {

    constructor() {
        super(4, 19);
    }

    public async apply(dbService: DbService) {
        await dbService.read({
            table: LearnerAssessmentsEntry.TABLE_NAME,
            columns: []
        }).pipe(
            map((rows: LearnerSummaryEntry.SchemaMap[]) => {
                rows.forEach(async (row: LearnerSummaryEntry.SchemaMap) => {
                    const total = Number(row[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS]);
                    row[LearnerSummaryEntry.COLUMN_NAME_TOTAL_TS] = Math.round(total / 1000);
                    await dbService.update({
                        table: LearnerSummaryEntry.TABLE_NAME,
                        modelJson: row
                    }).toPromise();
                });
            })
        ).toPromise();

        return undefined;
    }

    queries(): Array<string> {
        return [];
    }

}
