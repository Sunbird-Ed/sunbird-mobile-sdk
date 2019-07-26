import { SearchEntry } from '..';
import { SearchHistoryEntry } from '../db/schema';
export declare class SearchHistoryDbEntryMapper {
    static mapSearchHistoryDbEntryToSearchEntry(dbEntry: SearchHistoryEntry.SchemaMap): SearchEntry;
}
