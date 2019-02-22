import { CachedItemStore, KeyValueStore } from '..';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../api';
export declare class CachedItemStoreImpl<T> implements CachedItemStore<T> {
    private keyValueStore;
    private apiConfig;
    constructor(keyValueStore: KeyValueStore, apiConfig: ApiConfig);
    getCached(id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<T>, initial?: () => Observable<T>, timeToLive?: number): Observable<T>;
    private isItemCachedInDb;
    private isItemTTLExpired;
    private saveItem;
    private saveItemTTL;
    private saveItemToDb;
}
