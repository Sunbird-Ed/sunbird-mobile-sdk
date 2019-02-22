import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { SystemSettings, GetSystemSettingsRequest, SystemSettingsConfig } from '..';
import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
export declare class GetSystemSettingsHandler implements ApiRequestHandler<GetSystemSettingsRequest, SystemSettings> {
    private apiService;
    private systemSettingsConfig;
    private fileservice;
    private cachedItemStore;
    private readonly SYSTEM_SETTINGS_FILE_KEY_PREFIX;
    private readonly SYSTEM_SETTINGS_LOCAL_KEY;
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT;
    constructor(apiService: ApiService, systemSettingsConfig: SystemSettingsConfig, fileservice: FileService, cachedItemStore: CachedItemStore<SystemSettings>);
    handle(request: GetSystemSettingsRequest): Observable<SystemSettings>;
    private fetchFromServer;
    private fetchFromFile;
}
