import {SearchEntry, SearchHistoryService} from '..';
import {inject, injectable} from 'inversify';
import {Observable} from 'rxjs';
import {AddEntryRequest, GetEntriesRequest} from '../def/requests';
import {InjectionTokens} from '../../../injection-tokens';
import {DbService} from '../../../db';
import {ProfileService} from '../../../profile';
import {SearchHistoryEntry} from '../db/schema';

@injectable()
export class SearchHistoryServiceImpl implements SearchHistoryService {
    constructor(@inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService) {
    }

    addEntry({searchTerm, namespace}: AddEntryRequest): Observable<undefined> {
        return this.profileService.getActiveProfileSession()
            .mergeMap(({uid}) => {
                return this.dbService.insert({
                    table: SearchHistoryEntry.TABLE_NAME,
                    modelJson: {
                        [SearchHistoryEntry.COLUMN_NAME_SEARCH_TERM]: searchTerm.trim(),
                        [SearchHistoryEntry.COLUMN_NAME_NAMESPACE]: namespace,
                        [SearchHistoryEntry.COLUMN_NAME_USER_ID]: uid,
                        [SearchHistoryEntry.COLUMN_NAME_TIME_STAMP]: Date.now()
                    } as Partial<SearchHistoryEntry.SchemaMap>
                });
            })
            .mapTo(undefined);
    }

    getEntries({like, limit, namespace}: GetEntriesRequest): Observable<SearchEntry[]> {
        return this.profileService.getActiveProfileSession()
            .mergeMap(({uid}) => {
                let likeQuery = '';

                if (like) {
                    likeQuery = `AND ${SearchHistoryEntry.COLUMN_NAME_SEARCH_TERM} LIKE "%${like.trim()}%"`;
                }

                return this.dbService.execute(`
                    SELECT * FROM ${SearchHistoryEntry.TABLE_NAME} WHERE
                    ${SearchHistoryEntry.COLUMN_NAME_USER_ID} = "${uid}" AND
                    ${SearchHistoryEntry.COLUMN_NAME_NAMESPACE} = "${namespace}"
                    ${likeQuery}
                    ORDER BY ${SearchHistoryEntry.COLUMN_NAME_TIME_STAMP} DESC
                    LIMIT ${limit}
                `);
            });
    }
}
