import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {PageAssembleCriteria} from '..';
import {PageAssemble} from '../def/page-assemble';
import {PageServiceConfig} from '../config/page-service-config';
import {FileService} from '../../util/file/def/file-service';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {SessionAuthenticator} from '../../auth';
import {Path} from '../../util/file/util/path';

export class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private readonly KEY_PAGE_ASSEMBLE = 'pageAssemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINST = 'page/assemble';

    constructor(private apiService: ApiService,
                private pageApiServiceConfig: PageServiceConfig,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore<PageAssemble>,
                private sessionAuthenticator: SessionAuthenticator
    ) {
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        return this.cachedItemStore.getCached(
            this.getIdForDb(request),
            this.KEY_PAGE_ASSEMBLE,
            this.KEY_PAGE_ASSEMBLE,
            () => this.fetchFromServer(request),
            () => this.fetchFromFilePath()
        );
    }

    private getIdForDb(request: PageAssembleCriteria): string {
        let key = '';
        key += request.name + request.mode + request.filters;
        return key;
    }

    private fetchFromServer(request: PageAssembleCriteria): Observable<PageAssemble> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.pageApiServiceConfig.apiPath + this.PAGE_ASSEMBLE_ENDPOINST + this.getIdForDb(request))
            .withApiToken(true)
            .withBody(request)
            .withInterceptors([this.sessionAuthenticator])
            .build();
        return this.apiService.fetch<{ result: PageAssemble }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

    private fetchFromFilePath(): Observable<PageAssemble> {
        const fileDirPath = Path.dirPathFromFilePath(this.pageApiServiceConfig.filePath);
        const filePath = Path.fileNameFromFilePath(this.pageApiServiceConfig.filePath);
        return Observable.fromPromise(this.fileService.readAsText(fileDirPath, filePath)).map((fileContent: string) => {
            return JSON.parse(fileContent);
        });
    }
}
