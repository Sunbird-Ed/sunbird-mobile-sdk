import {PageAssembleCriteria, PageAssembleService, PageServiceConfig} from '..';
import {PageAssemble} from '..';
import {Observable} from 'rxjs';
import {PageAssemblerHandler} from '../handle/page-assembler-handler';
import {ApiService} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
import { inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';

@injectable()
export class PageAssembleServiceImpl implements PageAssembleService {

    private pageAssembleServiceConfig: PageServiceConfig;

    constructor(@inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences
    ) {
        this.pageAssembleServiceConfig = this.sdkConfig.pageServiceConfig;
    }

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble> {
        return new PageAssemblerHandler(this.apiService, this.pageAssembleServiceConfig,
            this.cachedItemStore, this.keyValueStore, this.sharedPreferences).handle(criteria);
    }

}
