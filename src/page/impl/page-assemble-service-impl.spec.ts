import { PageAssembleServiceImpl } from './page-assemble-service-impl';
import { Container } from 'inversify';
import { PageAssembleService } from '..';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig, DeviceInfo, CachedItemStore, KeyValueStore, SharedPreferences } from '../..';
import { ApiService } from '../../api';
import { mockSdkConfig } from './page-assemble-service-impl.spec.data';
import { PageName, PageAssembleCriteria } from '../def/requests';
import {PageAssemblerHandler} from '../handle/page-assembler-handler';
import { of } from 'rxjs';

jest.mock('../handle/page-assembler-handler');

describe('PageAssembleServiceImpl', () => {
    let pageAssembleServiceImpl: PageAssembleServiceImpl;
    const container: Container = new Container();
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        container.bind<PageAssembleService>(InjectionTokens.PAGE_ASSEMBLE_SERVICE).to(PageAssembleServiceImpl);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);

        pageAssembleServiceImpl = container.get(InjectionTokens.PAGE_ASSEMBLE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (PageAssemblerHandler as any as jest.Mock<PageAssemblerHandler>).mockClear();
    });

    it('should be create a instance of pageAssembleServiceImpl', () => {
        expect(pageAssembleServiceImpl).toBeTruthy();
    });

    it('should get details(like name, section, filter)of page by invoked getPageAssemble()', (done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.RESOURCE,
            source: 'app'
        };

        const handleMethod = jest.fn(() => of(''));

        (PageAssemblerHandler as any as jest.Mock<PageAssemblerHandler>).mockImplementation(() => {
            return {
                handle: handleMethod,
            };
        });
        // act
        pageAssembleServiceImpl.getPageAssemble(request).subscribe(() => {
            expect(handleMethod).toBeCalled();
            done();
        });
        // assert
    });
});
