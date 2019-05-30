import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {
    GetSystemSettingsRequest,
    SystemSettingsService,
    SystemSettingsConfig,
    SystemSettings
} from '..';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';
import { GetSystemSettingsHandler } from '../handlers/get-system-settings-handler';
import { injectable, inject } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';

@injectable()
export class SystemSettingsServiceImpl implements SystemSettingsService {
    private systemSettingsConfig: SystemSettingsConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedChannelItemStore: CachedItemStore,
    ) {}

    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings> {
        return new GetSystemSettingsHandler(
            this.apiService,
            this.systemSettingsConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }
}
