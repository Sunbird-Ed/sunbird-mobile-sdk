import {CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import {Framework, FrameworkDetailsRequest, FrameworkServiceConfig} from '..';
import {FrameworkMapper} from '../util/framework-mapper';


export class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private readonly FRAMEWORK_FILE_KEY_PREFIX = 'framework-';
    private readonly FRAMEWORK_LOCAL_KEY = 'framework-';
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';


    constructor(
        private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private fileservice: FileService,
                private cachedItemStore: CachedItemStore<Framework>) {
    }

    handle(request: FrameworkDetailsRequest): Observable<Framework> {
        return this.cachedItemStore.getCached(
            request.frameworkId,
            this.FRAMEWORK_LOCAL_KEY,
            this.FRAMEWORK_LOCAL_KEY,
            () => this.fetchFromServer(request),
            () => this.fetchFromFile(request)
        );
    }

    private fetchFromServer(request: FrameworkDetailsRequest): Observable<Framework> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.frameworkApiPath + this.GET_FRAMEWORK_DETAILS_ENDPOINT + '/' + request.frameworkId)
            .withParameters({categories: request.categories.join(',')})
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { framework: Framework } }>(apiRequest)
            .map((response) => {
                return response.body.result.framework;
            })
            .map((framework: Framework) => {
                return FrameworkMapper.prepareCategoryAssociations(framework);
            });
    }

    private fetchFromFile(request: FrameworkDetailsRequest): Observable<Framework> {
        const dir = Path.ASSETS_PATH + this.frameworkServiceConfig.frameworkConfigDirPath;
        const file = this.FRAMEWORK_FILE_KEY_PREFIX + request.frameworkId + '.json';

        return Observable.fromPromise(this.fileservice.readAsText(dir, file))
            .map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return (result.result.framework);
            });
    }

}
