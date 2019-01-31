import { PageAssembleCriteria, PageAssembleService } from '..';
import { PageAssemble } from '../def/page-assemble';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { PageServiceConfig } from '../config/page-service-config';
import { FileService } from '../../util/file/def/file-service';
import { SessionAuthenticator } from '../../auth';
import { CachedItemStore } from '../../key-value-store';
export declare class PageAssembleServiceImpl implements PageAssembleService {
    private apiService;
    private pageAssembleServiceConfig;
    private fileService;
    private sessionAuthenticator;
    private cachedItemStore;
    constructor(apiService: ApiService, pageAssembleServiceConfig: PageServiceConfig, fileService: FileService, sessionAuthenticator: SessionAuthenticator, cachedItemStore: CachedItemStore<PageAssemble>);
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
