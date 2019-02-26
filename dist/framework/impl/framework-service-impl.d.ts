import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { Channel, ChannelDetailsRequest, Framework, FrameworkDetailsRequest, FrameworkService, FrameworkServiceConfig, OrganizationSearchCriteria } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { Organization } from '../def/Organization';
import { ApiService } from '../../api';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class FrameworkServiceImpl implements FrameworkService {
    private frameworkServiceConfig;
    private keyValueStore;
    private fileService;
    private apiService;
    private cachedChannelItemStore;
    private cachedFrameworkItemStore;
    private sharedPreferences;
    private static readonly KEY_ACTIVE_CHANNEL_ID;
    private static readonly SEARCH_ORGANIZATION_ENDPOINT;
    constructor(frameworkServiceConfig: FrameworkServiceConfig, keyValueStore: KeyValueStore, fileService: FileService, apiService: ApiService, cachedChannelItemStore: CachedItemStore<Channel>, cachedFrameworkItemStore: CachedItemStore<Framework>, sharedPreferences: SharedPreferences);
    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;
    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;
    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>>;
    getActiveChannelId(): Observable<string>;
    setActiveChannelId(channelId: string): Observable<undefined>;
}
