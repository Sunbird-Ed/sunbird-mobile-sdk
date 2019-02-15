import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Channel, ChannelDetailsRequest, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
export declare class FrameworkServiceImpl implements FrameworkService {
    private frameworkServiceConfig;
    private keyValueStore;
    private fileService;
    private apiService;
    private cachedChannelItemStore;
    private cachedFrameworkItemStore;
    DB_KEY_FRAMEWORK_DETAILS: string;
    constructor(frameworkServiceConfig: FrameworkServiceConfig, keyValueStore: KeyValueStore, fileService: FileService, apiService: ApiService, cachedChannelItemStore: CachedItemStore<Channel>, cachedFrameworkItemStore: CachedItemStore<Framework>);
    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;
    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;
    persistFrameworkDetails(request: Framework): Observable<boolean>;
}
