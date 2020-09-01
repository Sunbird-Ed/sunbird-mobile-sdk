import { DbService, Migration } from '..';
import { ContentEntry, ContentAccessEntry } from '../../content/db/schema';

export class ContentPrimaryCategoryMigration extends Migration {

    constructor() {
        super(15, 28);
    }

    public async apply(dbService: DbService) {
        await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
        dbService.beginTransaction();
        try {
            await dbService.execute(`UPDATE ${ContentEntry.TABLE_NAME} SET ${ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY} = ${ContentEntry.COLUMN_NAME_CONTENT_TYPE}`).toPromise();
            await dbService.execute(`UPDATE ${ContentAccessEntry.TABLE_NAME} SET ${ContentAccessEntry.COLUMN_NAME_PRIMARY_CATEGORY} = ${ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE}`).toPromise();
            dbService.endTransaction(true);
        } catch (e) {
            console.error(e);
            dbService.endTransaction(false);
            throw e;
        }
        return undefined;
    }

    queries(): Array<string> {
        return [
            ContentEntry.getAlterEntryForPrimaryCategory(),
            ContentAccessEntry.getAlterEntryForPrimaryCategory()
        ];
    }
}
