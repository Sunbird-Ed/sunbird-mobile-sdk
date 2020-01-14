import {DbService, Migration} from '..';
import {ContentEntry, ContentMarkerEntry} from '../../content/db/schema';
import {map} from 'rxjs/operators';

export class RecentlyViewedMigration extends Migration {

    constructor() {
        super(9, 24);
    }

    public async apply(dbService: DbService) {
        await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
        await dbService.read({
            table: ContentMarkerEntry.TABLE_NAME
        }).pipe(
            map((rows: ContentMarkerEntry.SchemaMap[]) => {
                rows.forEach(async (row: ContentMarkerEntry.SchemaMap) => {
                    const localDataRow = row[ContentMarkerEntry.COLUMN_NAME_DATA];
                    if (localDataRow) {
                        const localData = JSON.parse(localDataRow);
                        row[ContentEntry.COLUMN_NAME_MIME_TYPE] = localData['mimeType'];
                        await dbService.update({
                            table: ContentMarkerEntry.TABLE_NAME,
                            modelJson: row,
                            selection: `${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER} = ?`,
                            selectionArgs: [row[ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER]]
                        }).toPromise();
                    }
                });
            })
        ).toPromise();

        return undefined;
    }

    queries(): Array<string> {
        return [
            ContentMarkerEntry.getAlterEntryForMimeType()
        ];
    }

}
