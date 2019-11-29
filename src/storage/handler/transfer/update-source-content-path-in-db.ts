import {TransferContentContext} from '../transfer-content-handler';
import {DbService} from '../../../db';
import {ContentEntry} from '../../../content/db/schema';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import {ContentUtil} from '../../../content/util/content-util';
import {defer, Observable} from 'rxjs';
import {mapTo} from 'rxjs/operators';

export class UpdateSourceContentPathInDb {
    constructor(private dbService: DbService) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return defer(async () => {
            this.dbService.beginTransaction();

            try {
                for (const content of context.contentsInSource!) {
                    content[COLUMN_NAME_PATH] = ContentUtil.getBasePath(context.destinationFolder!.concat(
                        content[COLUMN_NAME_IDENTIFIER], '/'));

                    await this.dbService.update({
                        table: ContentEntry.TABLE_NAME,
                        selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                        selectionArgs: [content[ContentEntry.COLUMN_NAME_IDENTIFIER]],
                        modelJson: content
                    }).toPromise();
                }

                this.dbService.endTransaction(true);
            } catch (e) {
                this.dbService.endTransaction(false);
            }
        }).pipe(
            mapTo(context)
        );
    }
}
