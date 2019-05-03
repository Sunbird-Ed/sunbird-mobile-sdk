import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {MimeType} from '..';
import {Observable} from 'rxjs';

export class ContentStorageHandler {
    constructor(private dbService: DbService) {
    }

    public getUsgaeSpace(path: string): Observable<number> {
        const query = `SELECT SUM(${ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE}) as total_size
                       FROM ${ContentEntry.TABLE_NAME}
                       WHERE ${ContentEntry.COLUMN_NAME_PATH}
                       LIKE '${path.replace('file://', '')}%'`;
        return this.dbService.execute(query).map((result) => {
            return result[0]['total_size'];
        });
    }

}
