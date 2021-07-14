import { CachedItemStore, KeyValueStore } from '..';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
import { SdkConfig } from '../../sdk-config';
export declare class CachedItemStoreImpl implements CachedItemStore {
    private sdkConfig;
    private keyValueStore;
    private sharedPreferences;
    private apiConfig;
    constructor(sdkConfig: SdkConfig, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences);
    private static isItemEmpty;
    get<T>(id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<T>, initial?: () => Observable<T>, timeToLive?: number, emptyCondition?: (item: T) => boolean): Observable<T>;
    getCached<T>(id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<T>, initial?: () => Observable<T>, timeToLive?: number, emptyCondition?: (item: T) => boolean): Observable<T>;
    private isItemCachedInDb;
    private isItemTTLExpired;
    private saveItem;
    private saveItemTTL;
    private saveItemToDb;
}
