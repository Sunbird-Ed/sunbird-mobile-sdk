import {PageAssembleCriteria, PageAssembleService, PageServiceConfig, SetPageAssembleChannelRequest} from '..';
import {PageAssemble} from '..';
import {Observable} from 'rxjs';
import {PageAssemblerFactory} from '../handle/page-assembler-factory';
import {ApiService} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
import { inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';
import {FrameworkService} from '../../framework';
import {AuthService} from '../../auth';
import {ProfileService} from '../../profile';
import {SystemSettingsService} from '../../system-settings';
import {DbService} from '../../db';
import {PageAssembleKeys} from '../../preference-keys';

@injectable()
export class PageAssembleServiceImpl implements PageAssembleService {

    private pageAssembleServiceConfig: PageServiceConfig;

    constructor(
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService,
        @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService
    ) {
        this.pageAssembleServiceConfig = this.sdkConfig.pageServiceConfig;
    }

    setPageAssembleChannel(request: SetPageAssembleChannelRequest): void {
        this.sharedPreferences.putString(PageAssembleKeys.KEY_ORGANISATION_ID, request.channelId).toPromise();
    }

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble> {
        return new PageAssemblerFactory(
            this.apiService,
            this.pageAssembleServiceConfig,
            this.cachedItemStore,
            this.keyValueStore,
            this.sharedPreferences,
            this.frameworkService,
            this.authService,
            this.systemSettingsService,
            this.dbService,
            this.profileService
        ).handle(criteria);
    }

}
