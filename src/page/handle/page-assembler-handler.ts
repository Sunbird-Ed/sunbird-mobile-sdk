import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {PageAssemble, PageAssembleCriteria, PageName, PageServiceConfig} from '..';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';
import {SharedPreferences} from '../../util/shared-preferences';

export class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private readonly PAGE_ASSEMBLE_LOCAL_KEY = 'page_assemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINT = '/page/assemble';
    private readonly DIALCODE_ASSEMBLE_ENDPOINT = '/dial/assemble';

    constructor(private apiService: ApiService,
                private pageApiServiceConfig: PageServiceConfig,
                private cachedItemStore: CachedItemStore,
                private keyValueStore: KeyValueStore,
                private sharedPreferences: SharedPreferences
    ) {
    }

    private static getIdForDb(request: PageAssembleCriteria): string {
        const key = request.name +
        (request.source || 'app') +
        (request.mode || '') +
        request.filters ? SHA1(JSON.stringify(request.filters)).toString() : '';
        return key;
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {

        request.from = request.from || CachedItemRequestSourceFrom.CACHE;

        return Observable.of(request.from)
            .mergeMap((from: CachedItemRequestSourceFrom) => {
                if (from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(request)
                        .do(async (pageAssembleRes) => {
                            const pageAssemble = JSON.stringify(pageAssembleRes);
                            await this.sharedPreferences.putString(
                                ('ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + PageAssemblerHandler.getIdForDb(request)), Date.now() + ''
                            ).toPromise();

                            await this.keyValueStore.setValue(
                                this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + PageAssemblerHandler.getIdForDb(request), pageAssemble
                            ).toPromise();
                        })
                        .catch(() => {
                            return this.fetchFromCache(request);
                        });
                }

                return this.fetchFromCache(request);
            });
    }


    private fetchFromServer(request: PageAssembleCriteria): Observable<PageAssemble> {

        const pageAssembleEndPoint = request.name === PageName.DIAL_CODE ? this.DIALCODE_ASSEMBLE_ENDPOINT : this.PAGE_ASSEMBLE_ENDPOINT;

        const apiRequest: Request = new Request.Builder()
            .withHost(this.pageApiServiceConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.pageApiServiceConfig.apiPath + pageAssembleEndPoint)
            .withApiToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch<{ result: { response: PageAssemble } }>(apiRequest)
            .map((success) => {
                return success.body.result.response;
            });
    }

    private fetchFromCache(request: PageAssembleCriteria): Observable<PageAssemble> {
        return this.cachedItemStore.getCached(
            PageAssemblerHandler.getIdForDb(request),
            this.PAGE_ASSEMBLE_LOCAL_KEY,
            'ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY,
            () => this.fetchFromServer(request)
        );
    }
}
