import { SearchEntry, SearchHistoryService } from '..';
import { Observable } from 'rxjs';
import { AddEntryRequest, GetEntriesRequest } from '../def/requests';
import { DbService } from '../../../db';
import { ProfileService } from '../../../profile';
export declare class SearchHistoryServiceImpl implements SearchHistoryService {
    private dbService;
    private profileService;
    private static MAX_USER_SEARCH_HISTORY_ENTRIES;
    constructor(dbService: DbService, profileService: ProfileService);
    addEntry({ query, namespace }: AddEntryRequest): Observable<undefined>;
    getEntries({ like, limit, namespace }: GetEntriesRequest): Observable<SearchEntry[]>;
}
