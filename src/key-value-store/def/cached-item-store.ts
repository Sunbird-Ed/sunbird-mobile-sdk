import {Observable} from 'rxjs';

export interface CachedItemStore<T> {
    getCached(
        id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<T>, initial?: () => Observable<T>
    ): Observable<T>;
}
