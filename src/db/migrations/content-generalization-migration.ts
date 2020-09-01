import { DbService, Migration } from '..';
import { ContentEntry, ContentAccessEntry } from '../../content/db/schema';
import { CategoryMapper } from '../../content/util/category-mapper';
import { map } from 'rxjs/operators';

export class ContentGeneralizationMigration extends Migration {

    constructor() {
        super(15, 28);
    }

    public async apply(dbService: DbService) {
        await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
        // dbService.beginTransaction();
        // try {
        //     const category = CategoryMapper.getPrimaryCategory(ContentEntry.COLUMN_NAME_CONTENT_TYPE, ContentEntry.COLUMN_NAME_MIME_TYPE);
        //     await dbService.execute(`UPDATE ${ContentEntry.TABLE_NAME} SET ${ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY} =
        //      ${category}`).toPromise();
        //     await dbService.execute(`UPDATE ${ContentAccessEntry.TABLE_NAME} SET ${ContentAccessEntry.COLUMN_NAME_PRIMARY_CATEGORY} = ${ContentAccessEntry.COLUMN_NAME_CONTENT_TYPE}`).toPromise();
        //     dbService.endTransaction(true);
        // } catch (e) {
        //     console.error(e);
        //     dbService.endTransaction(false);
        //     throw e;
        // }
        await dbService.read({
            table: ContentEntry.TABLE_NAME,
            selection: '',
            selectionArgs: []
        }).pipe(
            map((rows: ContentEntry.SchemaMap[]) => {
               // dbService.beginTransaction();
                rows.forEach(async (row: ContentEntry.SchemaMap) => {
                    const contentType = row[ContentEntry.COLUMN_NAME_CONTENT_TYPE];
                    const mimeType = row[ContentEntry.COLUMN_NAME_MIME_TYPE];
                    row[ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY] = CategoryMapper.getPrimaryCategory(contentType, mimeType).toLowerCase();
                    await dbService.update({
                        table: ContentEntry.TABLE_NAME,
                        modelJson: row,
                        selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                        selectionArgs: [row[ContentEntry.COLUMN_NAME_IDENTIFIER]]
                    }).toPromise();

                    await dbService.update({
                        table: ContentAccessEntry.TABLE_NAME,
                        modelJson: row,
                        selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                        selectionArgs: [row[ContentEntry.COLUMN_NAME_IDENTIFIER]]
                    }).toPromise();
                });
              //  dbService.endTransaction(false);
            })
        ).toPromise();
        return undefined;
    }

    queries(): Array<string> {
        return [
            ContentEntry.getAlterEntryForPrimaryCategory(),
            ContentAccessEntry.getAlterEntryForPrimaryCategory()
        ];
    }
}
