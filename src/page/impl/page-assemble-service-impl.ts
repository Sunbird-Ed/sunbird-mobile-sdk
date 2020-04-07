import {PageAssembleCriteria, PageAssembleService, PageServiceConfig, SetPageAssembleChannelRequest} from '..';
import {PageAssemble} from '..';
import {Observable} from 'rxjs';
import {PageAssemblerHandler} from '../handle/page-assembler-handler';
import {ApiService} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
import { inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';
import {PageAssembleKeys} from '../../preference-keys';
import {AuthService} from '../../auth';
import {ProfileService} from '../../profile';
import {SystemSettingsService} from '../../system-settings';

@injectable()
export class PageAssembleServiceImpl implements PageAssembleService {

    private pageAssembleServiceConfig: PageServiceConfig;

    constructor(
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService
    ) {
        this.pageAssembleServiceConfig = this.sdkConfig.pageServiceConfig;
    }

    setPageAssembleChannel(request: SetPageAssembleChannelRequest): void {
        this.sharedPreferences.putString(PageAssembleKeys.KEY_ORGANISATION_ID, request.channelId).toPromise();
    }

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble> {
        return new PageAssemblerHandler(
            this.apiService,
            this.pageAssembleServiceConfig,
            this.cachedItemStore,
            this.keyValueStore,
            this.sharedPreferences,
            this.authService,
            this.profileService,
            this.systemSettingsService
        ).handle(criteria);
    }

}
