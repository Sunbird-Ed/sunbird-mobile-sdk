import {DbService} from '../../db';
import {ContentEntry} from '../db/schema';
import {ContentSpaceUsageSummaryResponse, MimeType, Visibility} from '..';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

export class ContentStorageHandler {
    constructor(private dbService: DbService) {
    }

    public getUsgaeSpace(path: string): Observable<number> {
        const query = `SELECT SUM(${ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE}) as total_size
                      FROM ${ContentEntry.TABLE_NAME}
                      WHERE ${ContentEntry.COLUMN_NAME_VISIBILITY} = '${Visibility.DEFAULT.valueOf()}'
                      AND  ${ContentEntry.COLUMN_NAME_PATH} LIKE '${path.replace('file://', '')}%'`;
        return this.dbService.execute(query).pipe(
            map((result) => {
                return result[0]['total_size'] || 0;
            })
        );
    }

    public async getContentUsageSummary(paths: string[]): Promise<ContentSpaceUsageSummaryResponse[]> {
        const contentSpaceUsageSummaryList: ContentSpaceUsageSummaryResponse[] = [];
        for (const path of paths) {
            const size = await this.getUsgaeSpace(path).toPromise();
            contentSpaceUsageSummaryList.push({path: path, sizeOnDevice: size});
        }
        return contentSpaceUsageSummaryList;
    }
}
