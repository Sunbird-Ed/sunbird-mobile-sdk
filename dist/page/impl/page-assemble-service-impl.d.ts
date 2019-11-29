import { PageAssembleCriteria, PageAssembleService } from '..';
import { PageAssemble } from '..';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
import { SdkConfig } from '../../sdk-config';
export declare class PageAssembleServiceImpl implements PageAssembleService {
    private apiService;
    private sdkConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    private pageAssembleServiceConfig;
    constructor(apiService: ApiService, sdkConfig: SdkConfig, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences);
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
