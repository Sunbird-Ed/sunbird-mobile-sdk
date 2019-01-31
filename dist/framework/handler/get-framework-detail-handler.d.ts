import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { ApiRequestHandler, ApiService } from '../../api';
import { Observable } from 'rxjs';
import { Framework, FrameworkDetailsRequest, FrameworkServiceConfig } from '..';
import { SessionAuthenticator } from '../../auth';
export declare class GetFrameworkDetailsHandler implements ApiRequestHandler<FrameworkDetailsRequest, Framework> {
    private apiService;
    private frameworkServiceConfig;
    private sessionAuthenticator;
    private fileservice;
    private cachedItemStore;
    private readonly GET_FRAMEWORK_DETAILS_ENDPOINT;
    private readonly DB_KEY_FRAMEWORK_DETAILS;
    private readonly FRAMEWORK_DETAILS_API_EXPIRATION_KEY;
    constructor(apiService: ApiService, frameworkServiceConfig: FrameworkServiceConfig, sessionAuthenticator: SessionAuthenticator, fileservice: FileService, cachedItemStore: CachedItemStore<Framework>);
    handle(request: FrameworkDetailsRequest): Observable<Framework>;
    private fetchFromServer;
    private fetchFromFile;
}
