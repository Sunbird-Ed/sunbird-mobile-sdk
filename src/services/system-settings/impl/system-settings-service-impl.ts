import {CachedItemStore} from '../../key-value-store';
import {GetSystemSettingsRequest, SystemSettings, SystemSettingsConfig, SystemSettingsService} from '../index';
import {FileService} from '../../../native/file/def/file-service';
import {Observable} from 'rxjs';
import {HttpService} from '../../../native/http';
import {GetSystemSettingsHandler} from '../handlers/get-system-settings-handler';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../../bootstrap/sdk-config';

@injectable()
export class SystemSettingsServiceImpl implements SystemSettingsService {
    private systemSettingsConfig: SystemSettingsConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: HttpService,
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
