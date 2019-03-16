import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {PageAssembleCriteria, PageServiceConfig} from '..';
import {PageAssemble} from '../def/page-assemble';
import {FileService} from '../../util/file/def/file-service';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';

export class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private readonly PAGE_ASSEMBLE_LOCAL_KEY = 'page_assemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINT = '/page/assemble';

    constructor(private apiService: ApiService,
                private pageApiServiceConfig: PageServiceConfig,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore<PageAssemble>
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
        if (!request.source) {
            request.source = 'app';
        }
        return this.cachedItemStore.getCached(
            PageAssemblerHandler.getIdForDb(request),
            this.PAGE_ASSEMBLE_LOCAL_KEY,
            'ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY,
            () => this.fetchFromServer(request)
        );
    }

    private fetchFromServer(request: PageAssembleCriteria): Observable<PageAssemble> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.pageApiServiceConfig.apiPath + this.PAGE_ASSEMBLE_ENDPOINT)
            .withApiToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch<{ result: { response: PageAssemble } }>(apiRequest).map((success) => {
            return success.body.result.response;
        });
    }
}
