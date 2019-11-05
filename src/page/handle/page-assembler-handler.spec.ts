import {PageAssemblerHandler} from './page-assembler-handler';
import { ApiService, CachedItemStore, KeyValueStore, SharedPreferences, CachedItemRequestSourceFrom } from '../..';
import { PageServiceConfig, PageAssembleCriteria } from '..';
import { PageName } from '../def/requests';
import { Observable } from 'rxjs';

describe('PageAssemblerHandler', () => {
    let pageAssemblerHandler: PageAssemblerHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockPageServiceConfig: Partial<PageServiceConfig> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        pageAssemblerHandler = new PageAssemblerHandler(
            mockApiService as ApiService,
            mockPageServiceConfig as PageServiceConfig,
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of pageAssemblerHandler', () => {
        expect(pageAssemblerHandler).toBeTruthy();
    });

    it('should be handle QrCode Scan for Page Assembler in local', (done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.DIAL_CODE,
            source: 'app',
        };
        mockCachedItemStore.getCached = jest.fn(() => {});
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(Observable.of({}));
        // act
        pageAssemblerHandler.handle(request).subscribe(() => {
             // assert
            done();
        });
    });

    it('should be handle QrCode Scan for Page Assembler in server', async(done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.DIAL_CODE,
            source: 'app',
            from: CachedItemRequestSourceFrom.SERVER
        };
        mockCachedItemStore.getCached = jest.fn(() => {});
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(Observable.of({}));
        mockApiService.fetch = jest.fn(() => {});
        (mockApiService.fetch as jest.Mock).mockReturnValue(Observable.of({}));
        // act
        await pageAssemblerHandler.handle(request).subscribe(() => {
             // assert
            done();
        });
    });
});
