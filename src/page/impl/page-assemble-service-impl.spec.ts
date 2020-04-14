import { PageAssembleServiceImpl } from './page-assemble-service-impl';
import { Container } from 'inversify';
import { PageAssembleService } from '..';
import { InjectionTokens } from '../../injection-tokens';
import {
    SdkConfig,
    CachedItemStore,
    KeyValueStore,
    SharedPreferences,
    FrameworkService,
    AuthService,
    DbService,
    ProfileService,
    SystemSettingsService
} from '../..';
import { ApiService } from '../../api';
import { mockSdkConfig } from './page-assemble-service-impl.spec.data';
import { PageName, PageAssembleCriteria } from '..';
import {PageAssemblerFactory} from '../handle/page-assembler-factory';
import { of } from 'rxjs';

jest.mock('../handle/page-assembler-factory');

describe('PageAssembleServiceImpl', () => {
    let pageAssembleServiceImpl: PageAssembleServiceImpl;
    const container: Container = new Container();
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};

    beforeAll(() => {
        container.bind<PageAssembleService>(InjectionTokens.PAGE_ASSEMBLE_SERVICE).to(PageAssembleServiceImpl);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).toConstantValue(mockFrameworkService as FrameworkService);
        container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).toConstantValue(mockAuthService as AuthService);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).toConstantValue(mockSystemSettingsService as SystemSettingsService);

        pageAssembleServiceImpl = container.get(InjectionTokens.PAGE_ASSEMBLE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (PageAssemblerFactory as any as jest.Mock<PageAssemblerFactory>).mockClear();
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

        const handleMethod = jest.fn().mockImplementation(() => of(''));

        (PageAssemblerFactory as any as jest.Mock<PageAssemblerFactory>).mockImplementation(() => {
            return {
                handle: handleMethod,
            } as Partial<PageAssemblerFactory> as PageAssemblerFactory;
        });
        // act
        pageAssembleServiceImpl.getPageAssemble(request).subscribe(() => {
            expect(handleMethod).toBeCalled();
            done();
        });
        // assert
    });
});
