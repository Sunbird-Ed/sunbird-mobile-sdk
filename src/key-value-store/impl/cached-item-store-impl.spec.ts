import { Container, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { CachedItemStoreImpl } from './cached-item-store-impl';
import { CachedItemStore, KeyValueStore } from '..';
import { SdkConfig, SharedPreferences } from '../..';
import { mockSdkConfig } from '../../page/impl/page-assemble-service-impl.spec.data';
import { Observable, of, throwError } from 'rxjs';

@injectable()
class MockKeyValueStore implements KeyValueStore {
    private mockStore: { [key: string]: string | undefined } = {};

    getValue(key: string): Observable<string | undefined> {
        return of(this.mockStore[key]);
    }

    setValue(key: string, value: string): Observable<boolean> {
        this.mockStore[key] = value;
        return of(true);
    }
}

@injectable()
class MockSharedPreferences implements SharedPreferences {
    private mockStore: { [key: string]: any } = {};

    getBoolean(key: string): Observable<boolean> {
        return of(this.mockStore[key]);
    }

    getString(key: string): Observable<string | undefined> {
        return of(this.mockStore[key]);
    }

    putBoolean(key: string, value: boolean): Observable<boolean> {
        this.mockStore[key] = value;
        return of(true);
    }

    putString(key: string, value: string): Observable<undefined> {
        this.mockStore[key] = value;
        return of(undefined);
    }

    addListener(key: string, listener: (value: any) => void) {
    }

    removeListener(key: string, listener: (value: any) => void) {
    }
}

interface Sample {
    key: string;
}

describe('CachedItemStoreImpl', () => {
    let cachedItemStore: CachedItemStoreImpl;
    const container = new Container();

    beforeAll(() => {
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).to(CachedItemStoreImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).to(MockKeyValueStore).inSingletonScope();
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(MockSharedPreferences).inSingletonScope();

        cachedItemStore = container.get(InjectionTokens.CACHED_ITEM_STORE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be get an instance of cachedItemStoreImpl from container', () => {
        expect(cachedItemStore).toBeTruthy();
    });

    describe('getCached()', () => {
        describe('when item is empty array or empty object or passes custom empty condition', () => {
            it('should resolve item without saving in cache store', async (done) => {
                // arrange
                const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                const now = Date.now();
                spyOn(mockKeyValueStore, 'setValue').and.callThrough();

                // act
                const r1 = await cachedItemStore.getCached<{}>(
                    'sample_id_' + now,
                    'sample_no_sql_key',
                    'sample_ttl_key',
                    () => of({}),
                    () => of({})
                ).toPromise();

                const r2 = await cachedItemStore.getCached<string[]>(
                    'sample_id_' + now,
                    'sample_no_sql_key',
                    'sample_ttl_key',
                    () => of([]),
                    () => of([])
                ).toPromise();

                const r3 = await cachedItemStore.getCached<{ items: string[] }>(
                    'sample_id_' + now,
                    'sample_no_sql_key',
                    'sample_ttl_key',
                    () => of({ items: ['a', 'b', 'c'] }),
                    () => of({ items: ['a', 'b', 'c'] }),
                    undefined,
                    (i) => i.items.length < 10
                ).toPromise();

                // assert
                expect(r1).toEqual({});
                expect(r2).toEqual([]);
                expect(r3).toEqual({ items: ['a', 'b', 'c'] });
                expect(mockKeyValueStore.setValue).not.toHaveBeenCalled();

                done();
            });
        });

        describe('when item not cached in db', () => {
            describe('when initial source provided', () => {
                it('should fetch from server and save in cache store with ttl', (done) => {
                    // arrange
                    const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                    const now = Date.now();
                    spyOn(mockKeyValueStore, 'setValue').and.callThrough();

                    // act
                    cachedItemStore.getCached<Sample>(
                        'sample_id_' + now,
                        'sample_no_sql_key',
                        'sample_ttl_key',
                        () => of({ key: 'fromServer' }),
                    ).subscribe((result) => {
                        // assert
                        expect(result).toEqual({ key: 'fromServer' });
                        expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(
                            `sample_no_sql_key-sample_id_${now}`,
                            JSON.stringify({ key: 'fromServer' })
                        );
                        done();
                    });
                });
            });

            describe('when initial source provided', () => {
                it('should fetch from initial source and save in cache store with ttl', (done) => {
                    // arrange
                    const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                    const now = Date.now();
                    spyOn(mockKeyValueStore, 'setValue').and.callThrough();

                    // act
                    cachedItemStore.getCached<Sample>(
                        'sample_id_' + now,
                        'sample_no_sql_key',
                        'sample_ttl_key',
                        () => of({ key: 'fromServer' }),
                        () => of({ key: 'fromInitial' })
                    ).subscribe((result) => {
                        // assert
                        expect(result).toEqual({ key: 'fromInitial' });
                        expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(
                            `sample_no_sql_key-sample_id_${now}`,
                            JSON.stringify({ key: 'fromInitial' })
                        );
                        done();
                    });
                });

                // it('should fetch from server and save in cache store if initial store fails with ttl', (done) => {
                //     // arrange
                //     const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                //     const now = Date.now();
                //     spyOn(mockKeyValueStore, 'setValue').and.callThrough();

                //     // act
                //     cachedItemStore.getCached<Sample>(
                //         'sample_id_' + now,
                //         'sample_no_sql_key',
                //         'sample_ttl_key',
                //         () => of({ key: 'fromServer' }),
                //         () => throwError(new Error('Sample Error'))
                //     ).subscribe((result) => {
                //         // assert
                //         expect(result).toEqual({ key: 'fromServer' });
                //         // expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(
                //         //     `sample_no_sql_key-sample_id_${now}`,
                //         //     JSON.stringify({ key: 'fromServer' })
                //         // );
                //         done();
                //     });
                // });
            });
        });

        describe('when item cached in db', () => {
            describe('when ttl not expired', () => {
                // it('should fetch from cache store', async (done) => {
                //     // arrange
                //     const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                //     const now = Date.now();
                //     spyOn(mockKeyValueStore, 'setValue').and.callThrough();
                //     spyOn(mockKeyValueStore, 'getValue').and.callThrough();

                //     // act
                //     await cachedItemStore.getCached<Sample>(
                //         'sample_id_' + now,
                //         'sample_no_sql_key',
                //         'sample_ttl_key',
                //         () => of({ key: 'fromServer1' }),
                //     ).toPromise();

                //     jest.resetAllMocks();

                //     const response = await cachedItemStore.getCached<Sample>(
                //         'sample_id_' + now,
                //         'sample_no_sql_key',
                //         'sample_ttl_key',
                //         () => of({ key: 'fromServer2' }),
                //     ).toPromise();

                //     expect(mockKeyValueStore.getValue).toHaveBeenCalledWith(
                //         `sample_no_sql_key-sample_id_${now}`
                //     );

                //     expect(response).toEqual({ key: 'fromServer1' });

                //     done();
                // });
            });

            describe('when ttl expired', () => {
                it('should fetch from store and in parallel fetch from server and save in cache store updating ttl', async (done) => {
                    // arrange
                    const mockKeyValueStore = container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
                    const now = Date.now();
                    spyOn(mockKeyValueStore, 'setValue').and.callThrough();
                    spyOn(mockKeyValueStore, 'getValue').and.callThrough();

                    // act
                    await cachedItemStore.getCached<Sample>(
                        'sample_id_' + now,
                        'sample_no_sql_key',
                        'sample_ttl_key',
                        () => of({ key: 'fromServer1' }),
                    ).toPromise();

                    jest.resetAllMocks();

                    const response = await cachedItemStore.getCached<Sample>(
                        'sample_id_' + now,
                        'sample_no_sql_key',
                        'sample_ttl_key',
                        () => of({ key: 'fromServer2' }),
                        undefined,
                        0
                    ).toPromise();

                    setTimeout(() => {
                        expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(
                            `sample_no_sql_key-sample_id_${now}`,
                            JSON.stringify({ key: 'fromServer2' })
                        );

                        expect(response).toEqual({ key: 'fromServer1' });

                        done();
                    });
                });
            });
        });
    });

    describe('get()', () => {
        it('should first fetch from server before checking cache', async (done) => {
            // arrange
            const now1 = Date.now();

            // act
            const r1 = await cachedItemStore.get<Sample>(
                'sample_id_' + now1,
                'sample_no_sql_key',
                'sample_ttl_key',
                () => of({ key: 'fromServer1' }),
                () => of({ key: 'fromInitial1' })
            ).toPromise();

            const now2 = Date.now() - 100;

            const r2 = await cachedItemStore.get<Sample>(
                'sample_id_' + now2,
                'sample_no_sql_key',
                'sample_ttl_key',
                () => throwError(new Error('Sample Error')),
                () => of({ key: 'fromInitial2' })
            ).toPromise();

            // assert
            expect(r1).toEqual({ key: 'fromServer1' });
            expect(r2).toEqual({ key: 'fromInitial2' });
            done();
        });
    });
});
