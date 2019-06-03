import {CachedItemStore} from '../../key-value-store';
import {GetSystemSettingsRequest, SystemSettings, SystemSettingsConfig, SystemSettingsService} from '..';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';
import {GetSystemSettingsHandler} from '../handlers/get-system-settings-handler';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';

@injectable()
export class SystemSettingsServiceImpl implements SystemSettingsService {
    private systemSettingsConfig: SystemSettingsConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedChannelItemStore: CachedItemStore,
    ) {
        this.systemSettingsConfig = this.sdkConfig.systemSettingsConfig;
    }

    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings> {
        return new GetSystemSettingsHandler(
            this.apiService,
            this.systemSettingsConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }
}
