import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Channel, ChannelDetailsRequest, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig, OrganizationSearchCriteria } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { Organization } from '../def/Organization';
import { ApiService } from '../../api';
export declare class FrameworkServiceImpl implements FrameworkService {
    private frameworkServiceConfig;
    private keyValueStore;
    private fileService;
    private apiService;
    private cachedChannelItemStore;
    private cachedFrameworkItemStore;
    activeChannel$: Observable<Channel | undefined>;
    private activeChannelSource;
    DB_KEY_FRAMEWORK_DETAILS: string;
    private readonly SEARCH_ORGANIZATION_ENDPOINT;
    constructor(frameworkServiceConfig: FrameworkServiceConfig, keyValueStore: KeyValueStore, fileService: FileService, apiService: ApiService, cachedChannelItemStore: CachedItemStore<Channel>, cachedFrameworkItemStore: CachedItemStore<Framework>);
    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;
    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;
    persistFrameworkDetails(request: Framework): Observable<boolean>;
    setActiveChannel(channel: Channel): void;
    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>>;
}
