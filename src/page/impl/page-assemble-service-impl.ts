import {PageAssembleCriteria, PageAssembleService, PageServiceConfig} from '..';
import {PageAssemble} from '../def/page-assemble';
import {Observable} from 'rxjs';
import {PageAssemblerHandler} from '../handle/page-assembler-handler';
import {ApiService} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import { SharedPreferences } from '../../util/shared-preferences';

export class PageAssembleServiceImpl implements PageAssembleService {


    constructor(private apiService: ApiService,
                private pageAssembleServiceConfig: PageServiceConfig,
                private cachedItemStore: CachedItemStore<PageAssemble>,
                private keyValueStore: KeyValueStore,
                private sharedPreferences: SharedPreferences
                ) {
    }

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble> {
        return new PageAssemblerHandler(this.apiService, this.pageAssembleServiceConfig,
            this.cachedItemStore, this.keyValueStore, this.sharedPreferences).handle(criteria);
    }

}
