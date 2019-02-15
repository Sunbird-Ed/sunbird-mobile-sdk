import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
import { Framework, FrameworkDetailsRequest, FrameworkServiceConfig } from '..';
export declare class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private apiService;
    private frameworkServiceConfig;
    private fileservice;
    private cachedItemStore;
    private readonly FRAMEWORK_FILE_KEY_PREFIX;
    private readonly FRAMEWORK_LOCAL_KEY;
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT;
    constructor(apiService: ApiService, frameworkServiceConfig: FrameworkServiceConfig, fileservice: FileService, cachedItemStore: CachedItemStore<Framework>);
    handle(request: FrameworkDetailsRequest): Observable<Framework>;
    private fetchFromServer;
    private fetchFromFile;
}
