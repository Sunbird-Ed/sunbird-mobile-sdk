import {CachedItemStore} from '../def/cached-item-store';
import {Observable} from 'rxjs';
import {KeyValueStore} from '..';

export class CachedItemStoreImpl<T> implements CachedItemStore<T> {

    constructor(private keyValueStore: KeyValueStore) {
    }

    public getCached(
        id: string,
        noSqlkey: string,
        timeToLiveKey: string,
        fromServer: () => Observable<T>,
        initial?: () => Observable<T>
    ): Observable<T> {
        return this.isItemCachedInDb(timeToLiveKey, id)
            .mergeMap((isItemCachedInDb: boolean) => {
                if (isItemCachedInDb) {
                    return this.isItemTTLExpired()
                        .mergeMap((isItemTTLExpired: boolean) => {
                            if (isItemTTLExpired) {
                                return fromServer()
                                    .switchMap((item: T) => {
                                        return this.saveItem(id, timeToLiveKey, noSqlkey, item);
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

    private isItemTTLExpired(): Observable<boolean> {
        // TODO
        return Observable.of(false);
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
        return this.keyValueStore.setValue(noSqlkey + '-' + id, item);
    }
}
