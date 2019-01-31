import { ApiRequestHandler, ApiService } from '../../api';
import { PageAssembleCriteria } from '..';
import { PageAssemble } from '../def/page-assemble';
import { PageServiceConfig } from '../config/page-service-config';
import { FileService } from '../../util/file/def/file-service';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { SessionAuthenticator } from '../../auth';
export declare class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private apiService;
    private pageApiServiceConfig;
    private fileService;
    private cachedItemStore;
    private sessionAuthenticator;
    private readonly KEY_PAGE_ASSEMBLE;
    private readonly PAGE_ASSEMBLE_ENDPOINST;
    constructor(apiService: ApiService, pageApiServiceConfig: PageServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore<PageAssemble>, sessionAuthenticator: SessionAuthenticator);
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private getIdForDb;
    private fetchFromServer;
    private fetchFromFilePath;
}
