import {CachedItemStore, KeyValueStore} from '..';
import {defer, iif, Observable, of, zip} from 'rxjs';
import {ApiConfig} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';
import {inject, injectable} from 'inversify';
import {catchError, map, mergeMap, switchMap, tap} from 'rxjs/operators';

@injectable()
export class CachedItemStoreImpl implements CachedItemStore {

    private apiConfig: ApiConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    private static isItemEmpty(item: any) {
        if (Array.isArray(item) && item.length === 0) {
            return true;
        } else if (typeof item === 'object' && Object.keys(item).length === 0) {
            return true;
        }

        return false;
    }

    get<T>(
        id: string,
        noSqlkey: string,
        timeToLiveKey: string,
        fromServer: () => Observable<T>,
        initial?: () => Observable<T>,
        timeToLive?: number,
        emptyCondition?: (item: T) => boolean
    ): Observable<T> {
        return fromServer().pipe(
            tap(async (response) => {
                await this.saveItemTTL(id, timeToLiveKey).toPromise();

                await this.saveItemToDb(id, noSqlkey, response).toPromise();
            }),
            catchError(() => {
                return this.getCached<T>(
                    id,
                    noSqlkey,
                    timeToLiveKey,
                    fromServer,
                    initial,
                    timeToLive,
                    emptyCondition,
                );
            })
        );
    }

    public getCached<T>(
        id: string,
        noSqlkey: string,
        timeToLiveKey: string,
        fromServer: () => Observable<T>,
        initial?: () => Observable<T>,
        timeToLive?: number,
        emptyCondition?: (item: T) => boolean
    ): Observable<T> {
        return this.isItemCachedInDb(timeToLiveKey, id).pipe(
            mergeMap((isItemCachedInDb: boolean) => {
                if (isItemCachedInDb) {
                    return this.isItemTTLExpired(timeToLiveKey, id,
                        !isNaN(timeToLive!) ? timeToLive! : this.apiConfig.cached_requests.timeToLive).pipe(
                        mergeMap((isItemTTLExpired: boolean) => {
                            if (isItemTTLExpired) {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id).pipe(
                                    map((v) => typeof(v) == 'string' ? JSON.parse(v!): v),
                                    tap(async () => {
                                        try {
                                            await fromServer().pipe(
                                                switchMap((item: T) => {
                                                    return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                                                })
                                            ).toPromise();
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    })
                                );
                            } else {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id).pipe(
                                    map((v) => typeof(v) == 'string' ? JSON.parse(v!): v)
                                );
                            }
                        })
                    );
                } else {
                    if (initial) {
                        return initial().pipe(
                            switchMap((item: T) => {
                                return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                            }),
                            catchError((e) => {
                                return fromServer().pipe(
                                    switchMap((item: T) => {
                                        return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                                    })
                                );
                            })
                        );
                    } else {
                        return fromServer().pipe(
                            switchMap((item: T) => {
                                return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                            })
                        );
                    }
                }
            })
        );
    }

    private isItemCachedInDb(timeToLiveKey: string, id: string): Observable<boolean> {
        console.log("is item cacheed ", id);
        return this.sharedPreferences.getString(timeToLiveKey + '-' + id).pipe(
            mergeMap((ttl) => {
                return iif(
                    () => !!ttl,
                    defer(() => {
                        console.log("**** res item cached");
                        return of(true)}),
                    defer(() => {
                        console.log("**** res item cached false")
                        return of(false)})
                );
            }),catchError((e: any) => {
                console.log("**** res item error ", e);
                return of(false);
            })
        );
    }

    private isItemTTLExpired(timeToLiveKey: string, id: string, timeToLive: number): Observable<boolean> {
        return this.sharedPreferences.getString(timeToLiveKey + '-' + id).pipe(
            map((ttl) => {
                const savedTimestamp: number = Number(ttl);
                const nowTimeStamp: number = Date.now();
                if (nowTimeStamp - savedTimestamp < timeToLive) {
                    return false;
                }

                return true;
            })
        );
    }

    private saveItem<T>(id: string, timeToLiveKey: string, noSqlkey: string, item: T, emptyCondition?: (item: T) => boolean) {
        if (CachedItemStoreImpl.isItemEmpty(item) || (emptyCondition && emptyCondition(item))) {
            return of(item);
        }

        return zip(
            this.saveItemTTL(id, timeToLiveKey),
            this.saveItemToDb(id, noSqlkey, item)
        ).pipe(
            switchMap(() => {
                return of(item);
            })
        );
    }

    private saveItemTTL(id: string, timeToLiveKey: string): Observable<boolean> {
        return this.sharedPreferences.putString(timeToLiveKey + '-' + id, Date.now() + '').pipe(
            mergeMap((val) => {
                return of(true);
            })
        );
    }

    private saveItemToDb(id: string, noSqlkey: string, item): Observable<boolean> {
        return this.keyValueStore.setValue(noSqlkey + '-' + id, JSON.stringify(item));
    }
}
