import { CachedItemStore } from '../../key-value-store';
import { GetSystemSettingsRequest, SystemSettings, SystemSettingsService } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { SdkConfig } from '../../sdk-config';
export declare class SystemSettingsServiceImpl implements SystemSettingsService {
    private sdkConfig;
    private apiService;
    private fileService;
    private cachedChannelItemStore;
    private systemSettingsConfig;
    constructor(sdkConfig: SdkConfig, apiService: ApiService, fileService: FileService, cachedChannelItemStore: CachedItemStore);
    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings>;
}
