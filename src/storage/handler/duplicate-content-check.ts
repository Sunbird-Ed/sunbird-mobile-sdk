import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {TransferContentContext} from './transfer-content-handler';
import {ContentUtil} from '../../content/util/content-util';
import {ContentEntry} from '../../content/db/schema';

export class DuplicateContentCheck {
    constructor(private dbService: DbService) {
    }

    execute(context: TransferContentContext): Observable<void> {
    }

    private getContentsInDb(context: TransferContentContext): Observable<ContentEntry.SchemaMap[]> {
        if (context.contentIds!.length) {
            return this.dbService.execute(ContentUtil.getFindAllContentsWithIdentifierQuery(context.contentIds!));
        }

        return this.dbService.execute(ContentUtil.getFindAllContentsQuery());
    }
}
