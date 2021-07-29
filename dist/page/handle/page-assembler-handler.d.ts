import { ApiRequestHandler, ApiService } from '../../api';
import { PageAssemble, PageAssembleCriteria, PageServiceConfig } from '..';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    private readonly PAGE_ASSEMBLE_LOCAL_KEY;
    private readonly PAGE_ASSEMBLE_ENDPOINT;
    private readonly DIALCODE_ASSEMBLE_ENDPOINT;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, cachedItemStore: CachedItemStore, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences);
    private static getIdForDb;
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private fetchFromServer;
    private fetchFromCache;
}
