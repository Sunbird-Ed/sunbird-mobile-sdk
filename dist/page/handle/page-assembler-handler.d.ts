import { ApiRequestHandler, ApiService } from '../../api';
import { PageAssembleCriteria, PageServiceConfig } from '..';
import { PageAssemble } from '../def/page-assemble';
import { FileService } from '../../util/file/def/file-service';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
export declare class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private fileService;
    private cachedItemStore;
    private readonly PAGE_ASSEMBLE_LOCAL_KEY;
    private readonly PAGE_ASSEMBLE_ENDPOINT;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore<PageAssemble>);
    private static getIdForDb;
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private fetchFromServer;
}
