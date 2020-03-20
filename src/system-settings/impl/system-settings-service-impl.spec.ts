import {SystemSettingsServiceImpl} from './system-settings-service-impl';
import {GetSystemSettingsRequest, SystemSettingsService} from '..';
import {Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {ApiService} from '../../api';
import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {mockSdkConfigWithSystemSettingsConfig} from './system-settings-service-impl.spec.data';
import {GetSystemSettingsHandler} from '../handlers/get-system-settings-handler';
import {Observable, of} from 'rxjs';

jest.mock('../handlers/get-system-settings-handler');

describe('SystemSettingsServiceImpl', () => {
    let systemSettingsService: SystemSettingsService;

    const container = new Container();

    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
        container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).to(SystemSettingsServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithSystemSettingsConfig as SdkConfig);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);

        systemSettingsService = container.get<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (GetSystemSettingsHandler as jest.Mock<GetSystemSettingsHandler>).mockClear();
    });

    it('should return instance from the container', () => {
        expect(systemSettingsService).toBeTruthy();
    });

    it('should return systemSettings when getSystemSettings called', (done) => {
        // arrange
        const request: GetSystemSettingsRequest = {
            id: 'sample_id'
        };

        (GetSystemSettingsHandler as jest.Mock<GetSystemSettingsHandler>).mockImplementation(
            () => ({
                handle: () => of({
                    body: {
                        result: {
                            response: 'SUCCESS'
                        }
                    }
                })
            } as any)
        );

        // act
        systemSettingsService.getSystemSettings(request).subscribe(() => {
            expect(GetSystemSettingsHandler).toHaveBeenCalled();
            // assert
            done();
        });
    });
});
