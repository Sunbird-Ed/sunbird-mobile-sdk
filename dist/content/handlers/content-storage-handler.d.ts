import { DbService } from '../../db';
import { ContentSpaceUsageSummaryResponse } from '..';
import { Observable } from 'rxjs';
export declare class ContentStorageHandler {
    private dbService;
    constructor(dbService: DbService);
    getUsgaeSpace(path: string): Observable<number>;
    getContentUsageSummary(paths: string[]): Promise<ContentSpaceUsageSummaryResponse[]>;
}
