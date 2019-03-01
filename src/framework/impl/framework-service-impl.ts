import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {
    Channel,
    ChannelDetailsRequest,
    Framework,
    FrameworkDetailsRequest,
    FrameworkService,
    OrganizationSearchCriteria
} from '..';
import {GetChannelDetailsHandler} from '../handler/get-channel-detail-handler';
import {GetFrameworkDetailsHandler} from '../handler/get-framework-detail-handler';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {Organization} from '../def/Organization';
import {ApiService, HttpRequestType, Request} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';
import {NoActiveChannelFoundError} from '../errors/no-active-channel-found-error';
import {SystemSettingsService} from '../../system-settings';
import {SdkConfig} from '../../sdk-config';

export class FrameworkServiceImpl implements FrameworkService {
    private static readonly KEY_ACTIVE_CHANNEL_ID = 'active_channel_id';
    private static readonly SEARCH_ORGANIZATION_ENDPOINT = '/search';

    constructor(private sdkConfig: SdkConfig,
                private keyValueStore: KeyValueStore,
                private fileService: FileService,
                private apiService: ApiService,
                private cachedChannelItemStore: CachedItemStore<Channel>,
                private cachedFrameworkItemStore: CachedItemStore<Framework>,
                private sharedPreferences: SharedPreferences,
                private systemSettingsService: SystemSettingsService) {
    }

    onInit(): Observable<undefined> {
        try {
            this.getActiveChannelId();
            return Observable.of(undefined);
        } catch (err) {
            return this.setActiveChannelId(this.sdkConfig.apiConfig.api_authentication.channelId);
        }
    }

    getDefaultChannelDetails(): Observable<Channel> {
        return this.systemSettingsService.getSystemSettings({id: this.sdkConfig.frameworkServiceConfig.systemSettingsDefaultChannelIdKey})
            .map((r) => r.value)
            .mergeMap((channelId: string) => {
                return this.getChannelDetails({channelId: channelId});
            });
    }

    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel> {
        return new GetChannelDetailsHandler(
            this.apiService,
            this.sdkConfig.frameworkServiceConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework> {
        return new GetFrameworkDetailsHandler(
            this,
            this.apiService,
            this.sdkConfig.frameworkServiceConfig,
            this.fileService,
            this.cachedFrameworkItemStore,
        ).handle(request);
    }

    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.sdkConfig.frameworkServiceConfig.searchOrganizationApiPath + FrameworkServiceImpl.SEARCH_ORGANIZATION_ENDPOINT)
            .withBody({request})
            .withApiToken(true)
            .build();

        return this.apiService.fetch<{ result: { response: Organization<T> } }>(apiRequest).map((response) => {
            return response.body.result.response;
        });
    }

    getActiveChannelId(): Observable<string> {
        return this.sharedPreferences.getString(FrameworkServiceImpl.KEY_ACTIVE_CHANNEL_ID)
            .map((channelId: string | undefined) => {
                if (!channelId) {
                    throw new NoActiveChannelFoundError('No Active channel Id set in preferences');
                }

                return channelId;
            });
    }

    setActiveChannelId(channelId: string): Observable<undefined> {
        return this.sharedPreferences.putString(FrameworkServiceImpl.KEY_ACTIVE_CHANNEL_ID, channelId);
    }
}
