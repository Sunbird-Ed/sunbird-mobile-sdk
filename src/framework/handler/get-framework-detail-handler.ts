import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Channel, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig} from '..';
import {FrameworkMapper} from '../util/framework-mapper';
import {defer, from, iif, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';


export class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private readonly FRAMEWORK_FILE_KEY_PREFIX = 'framework-';
    private readonly FRAMEWORK_LOCAL_KEY = 'framework-';
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT = '/read';


    constructor(private frameworkService: FrameworkService,
                private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore) {
    }

    handle(request: FrameworkDetailsRequest): Observable<Framework> {
        return iif(
            () => !!request.frameworkId,
            defer(() => {
                return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
                    request.frameworkId!,
                    this.FRAMEWORK_LOCAL_KEY,
                    'ttl_' + this.FRAMEWORK_LOCAL_KEY,
                    () => this.fetchFromServer(request),
                    () => this.fetchFromFile(request));
            }),
            defer(() => {
                return this.frameworkService.getDefaultChannelDetails().pipe(
                    mergeMap((channel: Channel) =>
                        this.frameworkService.getFrameworkDetails({
                            from: request.from,
                            frameworkId: channel.defaultFramework,
                            requiredCategories: request.requiredCategories
                        })
                    )
                );
            })
        );
    }

    private fetchFromServer(request: FrameworkDetailsRequest): Observable<Framework> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.frameworkApiPath + this.GET_FRAMEWORK_DETAILS_ENDPOINT + '/' + request.frameworkId)
            .withParameters({categories: request.requiredCategories.join(',')})
            .withBearerToken(true)
            .build();

        return this.apiService.fetch<{ result: { framework: Framework } }>(apiRequest).pipe(
            map((response) => {
                return response.body.result.framework;
            }),
            map((framework: Framework) => {
                return FrameworkMapper.prepareFrameworkCategoryAssociations(framework);
            })
        );
    }

    private fetchFromFile(request: FrameworkDetailsRequest): Observable<Framework> {
        const dir = Path.getAssetPath() + this.frameworkServiceConfig.frameworkConfigDirPath;
        const file = this.FRAMEWORK_FILE_KEY_PREFIX + request.frameworkId + '.json';

        return from(this.fileService.readFileFromAssets(dir.concat('/', file))).pipe(
            map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return result.result.framework;
            }),
            map((framework: Framework) => {
                return FrameworkMapper.prepareFrameworkCategoryAssociations(framework);
            })
        );
    }

}
