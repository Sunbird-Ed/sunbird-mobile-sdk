import {CachedItemStore, KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {ApiConfig} from '../../api';

export class CachedItemStoreImpl<T> implements CachedItemStore<T> {

    constructor(private keyValueStore: KeyValueStore,
                private apiConfig: ApiConfig) {
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
                                    .do(() => {
                                        fromServer().switchMap((item: T) => {
                                            return this.saveItem(id, timeToLiveKey, noSqlkey, item);
                                        }).subscribe(() => {
                                        });
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
        if (localStorage.getItem(timeToLiveKey + '-' + id)) {
            return Observable.of(true);
        }

        return Observable.of(false);
    }

    private isItemTTLExpired(timeToLiveKey: string, id: string, timeToLive: number): Observable<boolean> {
        const savedTimestamp: number = Number(localStorage.getItem(timeToLiveKey + '-' + id)!);
        const nowTimeStamp: number = Date.now();

        if (nowTimeStamp - savedTimestamp < timeToLive) {
            return Observable.of(false);
        } else {
            return Observable.of(true);
        }
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
        localStorage.setItem(timeToLiveKey + '-' + id, Date.now() + '');
        return Observable.of(true);
    }

    private saveItemToDb(id: string, noSqlkey: string, item): Observable<boolean> {
        return this.keyValueStore.setValue(noSqlkey + '-' + id, JSON.stringify(item));
    }
}
