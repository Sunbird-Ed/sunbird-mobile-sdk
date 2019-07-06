import {CachedItemStore} from '../../key-value-store';
import {Channel, ChannelDetailsRequest, Framework, FrameworkDetailsRequest, FrameworkService, OrganizationSearchCriteria} from '../index';
import {GetChannelDetailsHandler} from '../handler/get-channel-detail-handler';
import {GetFrameworkDetailsHandler} from '../handler/get-framework-detail-handler';
import {FileService} from '../../../native/file/def/file-service';
import {Observable} from 'rxjs';
import {Organization} from '../def/Organization';
import {HttpRequestType, HttpService, Request} from '../../../native/http';
import {SharedPreferences} from '../../../native/shared-preferences';
import {NoActiveChannelFoundError} from '../errors/no-active-channel-found-error';
import {SystemSettingsService} from '../../system-settings';
import {SdkConfig} from '../../../sdk-config';
import {FrameworkKeys} from '../../../preference-keys';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';

@injectable()
export class FrameworkServiceImpl implements FrameworkService {
    private static readonly KEY_ACTIVE_CHANNEL_ID = FrameworkKeys.KEY_ACTIVE_CHANNEL_ID;
    private static readonly SEARCH_ORGANIZATION_ENDPOINT = '/search';

    private _activeChannelId?: string;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
                @inject(InjectionTokens.API_SERVICE) private apiService: HttpService,
                @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
                @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService) {
    }

    get activeChannelId(): string | undefined {
        return this._activeChannelId;
    }

    preInit(): Observable<undefined> {
        return this.getActiveChannelId()
            .do((activeChannelId) => this._activeChannelId = activeChannelId)
            .mapTo(undefined)
            .catch((e) => {
                if (e instanceof NoActiveChannelFoundError) {
                    return this.setActiveChannelId(this.sdkConfig.apiConfig.api_authentication.channelId);
                }

                throw e;
            });
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
            this.cachedItemStore,
        ).handle(request);
    }

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework> {
        return new GetFrameworkDetailsHandler(
            this,
            this.apiService,
            this.sdkConfig.frameworkServiceConfig,
            this.fileService,
            this.cachedItemStore,
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
                    throw new NoActiveChannelFoundError('No Active channel ID set in preferences');
                }

                return channelId;
            });
    }

    setActiveChannelId(channelId: string): Observable<undefined> {
        this._activeChannelId = channelId;
        return this.sharedPreferences.putString(FrameworkServiceImpl.KEY_ACTIVE_CHANNEL_ID, channelId);
    }
}
