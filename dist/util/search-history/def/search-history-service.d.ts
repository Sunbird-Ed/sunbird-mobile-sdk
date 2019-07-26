import { Observable } from 'rxjs';
import { AddEntryRequest, GetEntriesRequest } from './requests';
import { SearchEntry } from './search-entry';
export interface SearchHistoryService {
    addEntry(request: AddEntryRequest): Observable<undefined>;
    getEntries(request: GetEntriesRequest): Observable<SearchEntry[]>;
}
