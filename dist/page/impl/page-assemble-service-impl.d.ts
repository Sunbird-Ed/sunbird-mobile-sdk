import { PageAssembleCriteria, PageAssembleService, PageServiceConfig } from '..';
import { PageAssemble } from '../def/page-assemble';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class PageAssembleServiceImpl implements PageAssembleService {
    private apiService;
    private pageAssembleServiceConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    constructor(apiService: ApiService, pageAssembleServiceConfig: PageServiceConfig, cachedItemStore: CachedItemStore<PageAssemble>, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences);
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
