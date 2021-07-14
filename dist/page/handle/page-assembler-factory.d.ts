import { ApiRequestHandler, ApiService } from '../../api';
import { PageAssemble, PageAssembleCriteria, PageServiceConfig } from '..';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
import { AuthService } from '../../auth';
import { FrameworkService } from '../../framework';
import { SystemSettingsService } from '../../system-settings';
import { DbService } from '../../db';
import { ProfileService } from '../../profile';
export declare class PageAssemblerFactory implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    private frameworkService;
    private authService;
    private systemSettingsService;
    private dbService;
    private profileService;
    private readonly defaultRequestDelegate;
    private readonly dialcodeRequestDelegate;
    private readonly courseRequestDelegate;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences, frameworkService: FrameworkService, authService: AuthService, systemSettingsService: SystemSettingsService, dbService: DbService, profileService: ProfileService);
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
}
