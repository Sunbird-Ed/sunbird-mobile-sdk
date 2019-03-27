import { ApiRequestHandler, ApiService } from '../../api';
import { PageAssembleCriteria, PageServiceConfig } from '..';
import { PageAssemble } from '../def/page-assemble';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { KeyValueStore } from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private cachedItemStore;
    private keyValueStore;
    private sharedPreferences;
    private readonly PAGE_ASSEMBLE_LOCAL_KEY;
    private readonly PAGE_ASSEMBLE_ENDPOINT;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, cachedItemStore: CachedItemStore<PageAssemble>, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences);
    private static getIdForDb;
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private fetchFromServer;
    private fetchFromCache;
}
