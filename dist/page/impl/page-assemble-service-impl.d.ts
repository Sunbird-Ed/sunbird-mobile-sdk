import { PageAssembleCriteria, PageAssembleService, SetPageAssembleChannelRequest } from '..';
import { PageAssemble } from '..';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
import { SdkConfig } from '../../sdk-config';
import { FrameworkService } from '../../framework';
import { AuthService } from '../../auth';
import { ProfileService } from '../../profile';
import { SystemSettingsService } from '../../system-settings';
import { DbService } from '../../db';
export declare class PageAssembleServiceImpl implements PageAssembleService {
    private apiService;
    private sdkConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    private frameworkService;
    private authService;
    private systemSettingsService;
    private dbService;
    private profileService;
    private pageAssembleServiceConfig;
    constructor(apiService: ApiService, sdkConfig: SdkConfig, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences, frameworkService: FrameworkService, authService: AuthService, systemSettingsService: SystemSettingsService, dbService: DbService, profileService: ProfileService);
    setPageAssembleChannel(request: SetPageAssembleChannelRequest): void;
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
