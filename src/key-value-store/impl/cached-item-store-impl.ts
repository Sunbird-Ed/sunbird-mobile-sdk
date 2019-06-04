import {CachedItemStore, KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {ApiConfig} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';
import { SdkConfig } from '../../sdk-config';
import { InjectionTokens } from '../../injection-tokens';
import { inject, injectable } from 'inversify';

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

    public getCached<T>(
        id: string,
        noSqlkey: string,
        timeToLiveKey: string,
        fromServer: () => Observable<T>,
        initial?: () => Observable<T>,
        timeToLive?: number,
        emptyCondition?: (item: T) => boolean
    ): Observable<T> {
        return this.isItemCachedInDb(timeToLiveKey, id)
            .mergeMap((isItemCachedInDb: boolean) => {
                if (isItemCachedInDb) {
                    return this.isItemTTLExpired(timeToLiveKey, id, !isNaN(timeToLive!) ? timeToLive! : this.apiConfig.cached_requests.timeToLive)
                        .mergeMap((isItemTTLExpired: boolean) => {
                            if (isItemTTLExpired) {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id)
                                    .map((v) => JSON.parse(v!))
                                    .do(async () => {
                                        try {
                                            await fromServer().switchMap((item: T) => {
                                                return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                                            }).toPromise();
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    });
                            } else {
                                return this.keyValueStore.getValue(noSqlkey + '-' + id)
                                    .map((v) => JSON.parse(v!));
                            }
                        });
                } else {
                    if (initial) {
                        return initial().switchMap((item: T) => {
                            return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                        }).catch((e) => {
                            return fromServer()
                                .switchMap((item: T) => {
                                    return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
                                });
                        });
                    } else {
                        return fromServer()
                            .switchMap((item: T) => {
                                return this.saveItem<T>(id, timeToLiveKey, noSqlkey, item, emptyCondition);
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
        .map((ttl) => {
            const savedTimestamp: number = Number(ttl);
            const nowTimeStamp: number = Date.now();
            if (nowTimeStamp - savedTimestamp < timeToLive) {
                return false;
            }
            
            return true;
        });
    }

    private saveItem<T>(id: string, timeToLiveKey: string, noSqlkey: string, item: T, emptyCondition?: (item: T) => boolean) {
        if (CachedItemStoreImpl.isItemEmpty(item) || (emptyCondition && emptyCondition(item))) {
            return Observable.of(item);
        }

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
