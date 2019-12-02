import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { ApiRequestHandler, ApiService } from '../../api';
import { Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private frameworkService;
    private apiService;
    private frameworkServiceConfig;
    private fileService;
    private cachedItemStore;
    private readonly FRAMEWORK_FILE_KEY_PREFIX;
    private readonly FRAMEWORK_LOCAL_KEY;
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT;
    constructor(frameworkService: FrameworkService, apiService: ApiService, frameworkServiceConfig: FrameworkServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore);
    handle(request: FrameworkDetailsRequest): Observable<Framework>;
    private fetchFromServer;
    private fetchFromFile;
}
