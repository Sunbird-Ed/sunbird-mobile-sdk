import {DbService, Migration} from '..';
import {LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {ContentEntry} from '../../content/db/schema';
import {ContentUtil} from '../../content/util/content-util';

export class OfflineSearchTextbookMigration extends Migration {

    constructor() {
        super(6, 21);
    }

    public async apply(dbService: DbService) {
        await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
        await dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: `${ContentEntry.COLUMN_NAME_CONTENT_TYPE} = ?`,
            selectionArgs: ['textbook']
        }).map((rows: ContentEntry.SchemaMap[]) => {
            rows.forEach(async (row: ContentEntry.SchemaMap) => {
                const localDataRow = row[ContentEntry.COLUMN_NAME_LOCAL_DATA];
                if (localDataRow) {
                    const localData = JSON.parse(localDataRow);
                    row[ContentEntry.COLUMN_NAME_BOARD] =  ContentUtil.getContentAttribute(localData['board']);
                    row[ContentEntry.COLUMN_NAME_MEDIUM] =  ContentUtil.getContentAttribute(localData['medium']);
                    row[ContentEntry.COLUMN_NAME_GRADE] =  ContentUtil.getContentAttribute(localData['gradeLevel']);
                    await dbService.update({
                        table: ContentEntry.TABLE_NAME,
                        modelJson: row,
                        selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                        selectionArgs: [row[ContentEntry.COLUMN_NAME_IDENTIFIER]]
                    }).toPromise();
                }
            });
        }).toPromise();

        return undefined;
    }

    queries(): Array<string> {
        return [ContentEntry.getAlterEntryForBoard(),
            ContentEntry.getAlterEntryForMedium(),
            ContentEntry.getAlterEntryForGrade()];
    }

}
