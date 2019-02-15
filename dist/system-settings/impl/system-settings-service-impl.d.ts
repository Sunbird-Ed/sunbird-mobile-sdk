import { CachedItemStore } from '../../key-value-store';
import { GetSystemSettingsRequest, SystemSettingsService, SystemSettingsConfig, SystemSettings } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
export declare class SystemSettingsServiceImpl implements SystemSettingsService {
    private systemSettingsConfig;
    private apiService;
    private fileService;
    private cachedChannelItemStore;
    constructor(systemSettingsConfig: SystemSettingsConfig, apiService: ApiService, fileService: FileService, cachedChannelItemStore: CachedItemStore<SystemSettings>);
    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings>;
}
