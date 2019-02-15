import { PageAssembleCriteria, PageAssembleService, PageServiceConfig } from '..';
import { PageAssemble } from '../def/page-assemble';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { FileService } from '../../util/file/def/file-service';
import { CachedItemStore } from '../../key-value-store';
export declare class PageAssembleServiceImpl implements PageAssembleService {
    private apiService;
    private pageAssembleServiceConfig;
    private fileService;
    private cachedItemStore;
    constructor(apiService: ApiService, pageAssembleServiceConfig: PageServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore<PageAssemble>);
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
