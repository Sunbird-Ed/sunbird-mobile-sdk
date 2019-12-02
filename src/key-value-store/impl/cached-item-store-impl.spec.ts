import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { CachedItemStoreImpl } from './cached-item-store-impl';
import { CachedItemStore, KeyValueStore } from '..';
import { SdkConfig, SharedPreferences } from '../..';
import { mockSdkConfig } from '../../page/impl/page-assemble-service-impl.spec.data';
import { Observable, timer, of } from 'rxjs';
describe('CachedItemStoreImpl', () => {
    let cachedItemStoreImpl: CachedItemStoreImpl;
    const container = new Container();
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).to(CachedItemStoreImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);

        cachedItemStoreImpl = container.get(InjectionTokens.CACHED_ITEM_STORE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of cachedItemStoreImpl', () => {
        expect(cachedItemStoreImpl).toBeTruthy();
    });

    it('should checked item store in DB or Item Expire', (done) => {
        // arrange
        const id = 'SAMPLE_ID';
        const noSqlkey = 'NOSQL_KEY';
        const timeToLiveKey = 'SAMPLE_TIME_TO_LIVE_KEY';
        const initial = jest.fn(() => timer(0, 5000));
        const fromServer = jest.fn(() => of({}));
        mockSharedPreferences.getString = jest.fn(() => {});
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of(''));
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
      //  (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(undefined));
        mockKeyValueStore.setValue = jest.fn(() => {});
        (mockKeyValueStore.setValue as jest.Mock).mockReturnValue(of(''));
        // act
        cachedItemStoreImpl.getCached(id, noSqlkey, timeToLiveKey, fromServer, initial).subscribe(() => {
           // expect(mockSharedPreferences.getString).toBeCalledWith(timeToLiveKey);
           // expect(mockSharedPreferences.putString).toHaveBeenCalledWith(noSqlkey, jest.fn(undefined));
         done();
        });
        // assert
    });

    it('should checked item store in DB or Item Expire', () => {
        // arrange
        const id = 'SAMPLE_ID';
        const noSqlkey = 'NOSQL_KEY';
        const timeToLiveKey = 'SAMPLE_TIME_TO_LIVE_KEY';
        const initial = jest.fn(() => '');
        const fromServer = jest.fn(() => {item: { } });
        mockSharedPreferences.getString = jest.fn(() => {});
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of(''));
        mockSharedPreferences.putString = jest.fn(() => {});
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of({}));
        mockKeyValueStore.setValue = jest.fn(() => {});
        (mockKeyValueStore.setValue as jest.Mock).mockReturnValue(of(''));
        // act
        cachedItemStoreImpl.getCached(id, noSqlkey, timeToLiveKey, fromServer, undefined).toPromise().catch(() => {
       //  done();
        });
        // assert
    });
});
