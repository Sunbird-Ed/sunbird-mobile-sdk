import {CachedItemStore} from '../../key-value-store';
import {GetSystemSettingsRequest, SystemSettings, SystemSettingsService} from '..';
import {FileService} from '../../../native/file/def/file-service';
import {Observable} from 'rxjs';
import {HttpService} from '../../../native/http';
import {GetSystemSettingsHandler} from '../handlers/get-system-settings-handler';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../..';

@injectable()
export class SystemSettingsServiceImpl implements SystemSettingsService {
    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: HttpService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedChannelItemStore: CachedItemStore,
    ) {
    }

    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings> {
        return new GetSystemSettingsHandler(
            this.apiService,
            this.sdkConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }
}
