import {SearchEntry} from '..';
import {SearchHistoryEntry} from '../db/schema';
import COLUMN_NAME_USER_ID = SearchHistoryEntry.COLUMN_NAME_USER_ID;
import COLUMN_NAME_QUERY = SearchHistoryEntry.COLUMN_NAME_QUERY;
import COLUMN_NAME_TIME_STAMP = SearchHistoryEntry.COLUMN_NAME_TIME_STAMP;

export class SearchHistoryDbEntryMapper {
    public static mapSearchHistoryDbEntryToSearchEntry(dbEntry: SearchHistoryEntry.SchemaMap): SearchEntry {
        return {
            uid: dbEntry[COLUMN_NAME_USER_ID],
            query: dbEntry[COLUMN_NAME_QUERY],
            timestamp: dbEntry[COLUMN_NAME_TIME_STAMP]
        };
    }
}
