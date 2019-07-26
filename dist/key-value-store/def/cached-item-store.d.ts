import { Observable } from 'rxjs';
export interface CachedItemStore {
    /**
     *  @param id: identifier of the cached item
     *  @param noSqlkey: prefix for noSQL store
     *  @param timeToLiveKey: prefix for preferences store
     *  @param fromServer: function returning server-request-observable for the item
     *  @param initial?: optional function returning initial-source-observable for the item; typically a file
     *  @param timeToLive?: optional timeToLive override in milliseconds
     *  @param emptyCondition?: optional emptyCondition predicate - when true, item won't be cached
     * */
    getCached<T>(id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<T>, initial?: () => Observable<T>, timeToLive?: number, emptyCondition?: (item: T) => boolean): Observable<T>;
}
