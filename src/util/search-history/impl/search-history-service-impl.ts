import {SearchEntry, SearchHistoryService} from '..';
import {inject, injectable} from 'inversify';
import {Observable} from 'rxjs';
import {AddEntryRequest, GetEntriesRequest} from '../def/requests';
import {InjectionTokens} from '../../../injection-tokens';
import {DbService} from '../../../db';
import {ProfileService} from '../../../profile';
import {SearchHistoryEntry} from '../db/schema';
import {SearchHistoryDbEntryMapper} from '../util/search-history-db-entry-mapper';
import {map, mapTo, mergeMap} from 'rxjs/operators';

@injectable()
export class SearchHistoryServiceImpl implements SearchHistoryService {
    private static MAX_USER_SEARCH_HISTORY_ENTRIES = 10;

    constructor(@inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService) {
    }

    addEntry({query, namespace}: AddEntryRequest): Observable<undefined> {
        return this.profileService.getActiveProfileSession()
            .pipe(
                mergeMap(({uid}) => {
                    return this.dbService.insert({
                        table: SearchHistoryEntry.TABLE_NAME,
                        modelJson: {
                            [SearchHistoryEntry.COLUMN_NAME_QUERY]: query.trim(),
                            [SearchHistoryEntry.COLUMN_NAME_NAMESPACE]: namespace,
                            [SearchHistoryEntry.COLUMN_NAME_USER_ID]: uid,
                            [SearchHistoryEntry.COLUMN_NAME_TIME_STAMP]: Date.now()
                        } as Partial<SearchHistoryEntry.SchemaMap>
                    }).pipe(
                        mapTo(uid)
                    );
                }),
                mergeMap((uid) => {
                    return this.dbService.execute(`
                        DELETE FROM ${SearchHistoryEntry.TABLE_NAME} WHERE
                        ${SearchHistoryEntry._ID} IN (SELECT ${SearchHistoryEntry._ID} FROM ${SearchHistoryEntry.TABLE_NAME} WHERE
                        ${SearchHistoryEntry.COLUMN_NAME_USER_ID} = "${uid}" AND
                        ${SearchHistoryEntry.COLUMN_NAME_NAMESPACE} = "${namespace}"
                        ORDER BY ${SearchHistoryEntry.COLUMN_NAME_TIME_STAMP} DESC
                        LIMIT -1 OFFSET ${SearchHistoryServiceImpl.MAX_USER_SEARCH_HISTORY_ENTRIES})
                    `);
                }),
                mapTo(undefined)
            );
    }

    getEntries({like, limit, namespace}: GetEntriesRequest): Observable<SearchEntry[]> {
        return this.profileService.getActiveProfileSession()
            .pipe(
                mergeMap(({uid}) => {
                    let likeQuery = '';

                    if (like) {
                        likeQuery = `AND ${SearchHistoryEntry.COLUMN_NAME_QUERY} LIKE "%${like.trim()}%"`;
                    }

                    return this.dbService.execute(`
                        SELECT * FROM ${SearchHistoryEntry.TABLE_NAME} WHERE
                        ${SearchHistoryEntry.COLUMN_NAME_USER_ID} = "${uid}" AND
                        ${SearchHistoryEntry.COLUMN_NAME_NAMESPACE} = "${namespace}"
                        ${likeQuery}
                        ORDER BY ${SearchHistoryEntry.COLUMN_NAME_TIME_STAMP} DESC
                        LIMIT ${limit}
                    `);
                }),
                map((entries: SearchHistoryEntry.SchemaMap[]) => {
                    return entries.map((entry) => {
                        return SearchHistoryDbEntryMapper.mapSearchHistoryDbEntryToSearchEntry(entry);
                    });
                })
            );
    }
}
