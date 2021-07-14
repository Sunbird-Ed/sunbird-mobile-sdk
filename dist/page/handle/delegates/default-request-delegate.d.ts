import { ApiRequestHandler, ApiService } from '../../../api';
import { PageAssembleCriteria, PageServiceConfig } from '../..';
import { PageAssemble } from '../../index';
import { CachedItemStore, KeyValueStore } from '../../../key-value-store';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../../util/shared-preferences';
import { AuthService } from '../../../auth';
import { ProfileService } from '../../../profile';
import { SystemSettingsService } from '../../../system-settings';
export declare class DefaultRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private sharedPreferences;
    private cachedItemStore;
    private keyValueStore;
    private authService;
    private profileService;
    private systemSettingsService;
    private readonly PAGE_ASSEMBLE_LOCAL_KEY;
    private readonly PAGE_ASSEMBLE_ENDPOINT;
    private readonly DIALCODE_ASSEMBLE_ENDPOINT;
    private static readonly SYSTEM_SETTINGS_TENANT_COURSE_PAGE_ID;
    private static getIdForDb;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, sharedPreferences: SharedPreferences, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, authService: AuthService, profileService: ProfileService, systemSettingsService: SystemSettingsService);
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private fetchFromServer;
    private fetchFromCache;
}
