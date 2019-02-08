import {CachedItemStore} from '../../key-value-store';
import {Path} from '../../util/file/util/path';
import {FileService} from '../../util/file/def/file-service';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import {Framework, FrameworkDetailsRequest, FrameworkServiceConfig} from '..';
import {SessionAuthenticator} from '../../auth';


export class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private readonly DB_KEY_FRAMEWORK_DETAILS = '/api/framework_details_key';
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT = '/api/framework/v1/read/';
    private readonly FRAMEWORK_DETAILS_API_EXPIRATION_KEY = 'FRAMEWORK_DETAILS_API_EXPIRATION_KEY';


    constructor(private apiService: ApiService,
                private frameworkServiceConfig: FrameworkServiceConfig,
                private sessionAuthenticator: SessionAuthenticator,
                private fileservice: FileService,
                private cachedItemStore: CachedItemStore<Framework>) {
    }

    handle(request: FrameworkDetailsRequest): Observable<Framework> {
        return this.cachedItemStore.getCached(
            request.frameworkId,
            this.DB_KEY_FRAMEWORK_DETAILS,
            this.FRAMEWORK_DETAILS_API_EXPIRATION_KEY,
            () => this.fetchFromServer(request),
            () => this.fetchFromFile(request)
        );
    }

    private fetchFromServer(request: FrameworkDetailsRequest): Observable<Framework> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.frameworkServiceConfig.apiPath + this.GET_FRAMEWORK_DETAILS_ENDPOINT + request.frameworkId)
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { framework: Framework } }>(apiRequest).map((response) => {
            return response.body.result.framework;
        });
    }

    private fetchFromFile(request: FrameworkDetailsRequest): Observable<Framework> {
        const file = this.frameworkServiceConfig.frameworkConfigFilePaths.find((val) => {
            return (val.indexOf(request.frameworkId) !== -1);
        });
        if (!file) {
            throw(new Error('File path does not exist'));
        }
        const fileDirPath = Path.dirPathFromFilePath(file);
        const filePath = Path.fileNameFromFilePath(file);
        return Observable.fromPromise(this.fileservice.readAsText(fileDirPath, filePath))
            .map((filecontent: string) => {
                return JSON.parse(filecontent);
            });
    }

}
