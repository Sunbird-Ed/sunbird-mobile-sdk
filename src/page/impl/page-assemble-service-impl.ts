import {PageAssembleCriteria, PageAssembleService} from '..';
import {PageAssemble} from '../def/page-assemble';
import {Observable} from 'rxjs';
import {PageAssemblerHandler} from '../handle/page-assembler-handler';
import {ApiService} from '../../api';
import {PageServiceConfig} from '../config/page-service-config';
import {FileService} from '../../util/file/def/file-service';
import {SessionAuthenticator} from '../../auth';
import {CachedItemStore} from '../../key-value-store';

export class PageAssembleServiceImpl implements PageAssembleService {


    constructor(private apiService: ApiService,
                private pageAssembleServiceConfig: PageServiceConfig,
                private fileService: FileService,
                private sessionAuthenticator: SessionAuthenticator,
                private cachedItemStore: CachedItemStore<PageAssemble>) {
    }

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble> {
        return new PageAssemblerHandler(this.apiService, this.pageAssembleServiceConfig,
            this.fileService, this.cachedItemStore, this.sessionAuthenticator).handle(criteria);
    }

}
