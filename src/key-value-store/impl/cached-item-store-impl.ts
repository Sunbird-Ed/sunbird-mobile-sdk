import {CachedItemStore, KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {ApiConfig} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';

export class CachedItemStoreImpl<T> implements CachedItemStore<T> {

    constructor(private keyValueStore: KeyValueStore,
        private apiConfig: ApiConfig,
        private sharedPreferences: SharedPreferences) {
    }

    public getCached(
        id: string,
        noSqlkey: string,
        timeToLiveKey: string,
        fromServer: () => Observable<T>,
        initial?: () => Observable<T>,
        timeToLive?: number
    ): Observable<T> {
        return this.isItemCachedInDb(timeToLiveKey, id)
            .mergeMap((isItemCachedInDb: boolean) => {
                if (isItemCachedInDb) {
                    return this.isItemTTLExpired(timeToLiveKey, id, timeToLive || this.apiConfig.cached_requests.timeToLive)
                        .mergeMap((isItemTTLExpired: boolean) => {
                            if (isItemTTLExpired) {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id)
                                    .map((v) => JSON.parse(v!))
                                    .do(async () => {
                                        await fromServer().switchMap((item: T) => {
                                            return this.saveItem(id, timeToLiveKey, noSqlkey, item);
                                        }).toPromise();
                                    });
                            } else {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id)
                                    .map((v) => JSON.parse(v!));
                            }
                        });
                } else {
                    if (initial) {
                        return initial().switchMap((item: T) => {
                            return this.saveItem(id, timeToLiveKey, noSqlkey, item);
                        }).catch((e) => {
                            return fromServer()
                                .switchMap((item: T) => {
                                    return this.saveItem(id, timeToLiveKey, noSqlkey, item);
                                });
                        });
                    } else {
                        return fromServer()
                            .switchMap((item: T) => {
                                return this.saveItem(id, timeToLiveKey, noSqlkey, item);
                            });
                    }
                }
            });
    }

    private isItemCachedInDb(timeToLiveKey: string, id: string): Observable<boolean> {
        return this.sharedPreferences.getString(timeToLiveKey + '-' + id)
            .mergeMap((ttl) => {
                return Observable.if(
                    () => !!ttl,
                    Observable.defer(() => Observable.of(true)),
                    Observable.defer(() => Observable.of(false))
                );
            });
    }

    private isItemTTLExpired(timeToLiveKey: string, id: string, timeToLive: number): Observable<boolean> {
        return this.sharedPreferences.getString(timeToLiveKey + '-' + id)
        .mergeMap((ttl) => {
            const savedTimestamp: number = Number(ttl);
            const nowTimeStamp: number = Date.now();
            if (nowTimeStamp - savedTimestamp < timeToLive) {
                return Observable.of(false);
            } else {
                return Observable.of(true);
            }
        });
    }

    private saveItem(id: string, timeToLiveKey: string, noSqlkey: string, item: T) {
        return Observable.zip(
            this.saveItemTTL(id, timeToLiveKey),
            this.saveItemToDb(id, noSqlkey, item)
        ).switchMap(() => {
            return Observable.of(item);
        });
    }

    private saveItemTTL(id: string, timeToLiveKey: string): Observable<boolean> {
        return this.sharedPreferences.putString(timeToLiveKey + '-' + id, Date.now() + '')
        .mergeMap((val) => {
            return Observable.of(true);
        });
    }

    private saveItemToDb(id: string, noSqlkey: string, item): Observable<boolean> {
        return this.keyValueStore.setValue(noSqlkey + '-' + id, JSON.stringify(item));
    }
}
