import { CachedItemRequestSourceFrom, CachedItemStore } from '../../key-value-store';
import {
    Channel,
    ChannelDetailsRequest,
    Framework,
    FrameworkDetailsRequest,
    FrameworkService,
    OrganizationSearchCriteria,
    OrganizationSearchResponse
} from '..';
import { GetChannelDetailsHandler } from '../handler/get-channel-detail-handler';
import { GetFrameworkDetailsHandler } from '../handler/get-framework-detail-handler';
import { FileService } from '../../util/file/def/file-service';
import { defer, iif, Observable, of } from 'rxjs';
import { Organization } from '../def/organization';
import { ApiService, HttpRequestType, Request } from '../../api';
import { SharedPreferences } from '../../util/shared-preferences';
import { NoActiveChannelFoundError } from '../errors/no-active-channel-found-error';
import { SystemSettingsService } from '../../system-settings';
import { SdkConfig } from '../../sdk-config';
import { FrameworkKeys } from '../../preference-keys';
import { inject, injectable, Container } from 'inversify';
import { CsInjectionTokens, InjectionTokens } from "../../injection-tokens";
import { catchError, map, mapTo, mergeMap, tap } from 'rxjs/operators';
import { CsModule } from '@project-sunbird/client-services';
import { CsFrameworkService } from '@project-sunbird/client-services/services/framework/interface';
import { FormParams } from '@project-sunbird/client-services/services/form/interface/cs-form-service';
import { FormRequest } from 'src';

@injectable()
export class FrameworkServiceImpl implements FrameworkService {
    private static readonly KEY_ACTIVE_CHANNEL_ID = FrameworkKeys.KEY_ACTIVE_CHANNEL_ID;
    private static readonly SEARCH_ORGANIZATION_ENDPOINT = '/search';

    private _activeChannelId?: string;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.SYSTEM_SETTINGS_SERVICE) private systemSettingsService: SystemSettingsService,
        @inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(CsInjectionTokens.FRAMEWORK_SERVICE) private csFrameworkService: CsFrameworkService) {
    }

    get activeChannelId(): string | undefined {
        return this._activeChannelId;
    }

    preInit(): Observable<undefined> {
        return this.getActiveChannelId().pipe(
            tap((activeChannelId) => this._activeChannelId = activeChannelId),
            mapTo(undefined),
            catchError((e) => {
                if (e instanceof NoActiveChannelFoundError) {
                    return this.setActiveChannelId(this.sdkConfig.apiConfig.api_authentication.channelId);
                }

                throw e;
            })
        );
    }


    getDefaultChannelId(): Observable<string> {
        return iif(
            () => (!this.sdkConfig.frameworkServiceConfig.overriddenDefaultChannelId),
            defer(() => {
                return this.systemSettingsService.getSystemSettings({
                    id: this.sdkConfig.frameworkServiceConfig.systemSettingsDefaultChannelIdKey
                }).pipe(
                    map((r) => r.value)
                );
            }),
            defer(() => {
                return of(this.sdkConfig.frameworkServiceConfig.overriddenDefaultChannelId as string)
            })
        );
    }

    getDefaultChannelDetails(request = { from: CachedItemRequestSourceFrom.CACHE }): Observable<Channel> {
        return this.systemSettingsService.getSystemSettings({
            id: this.sdkConfig.frameworkServiceConfig.systemSettingsDefaultChannelIdKey
        }).pipe(
            map((r) => r.value),
            mergeMap((channelId: string) => {
                return this.getChannelDetails({
                    from: request.from,
                    channelId: this.sdkConfig.frameworkServiceConfig.overriddenDefaultChannelId || channelId
                });
            })
        );
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

    getFrameworkConfig(frameworkId: string, formRequest?: FormRequest): Observable<any> {
        let params;
        if(formRequest){
            params = { type: formRequest.type, subType: formRequest.subType, action: formRequest.action, rootOrgId: formRequest.rootOrgId, framework: formRequest.framework, component: formRequest.component }
        }
        return this.csFrameworkService.getFrameworkConfig(frameworkId,
            { apiPath: "/api/framework/v1" },
            { apiPath: "/api/data/v1/form", params })
    }

    searchOrganization<T extends Partial<Organization>>(request: OrganizationSearchCriteria<T>): Observable<OrganizationSearchResponse<T>> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.sdkConfig.frameworkServiceConfig.searchOrganizationApiPath + FrameworkServiceImpl.SEARCH_ORGANIZATION_ENDPOINT)
            .withBody({ request })
            .withBearerToken(true)
            .build();

        return this.apiService.fetch<{ result: { response: OrganizationSearchResponse<T> } }>(apiRequest).pipe(
            map((response) => {
                return response.body.result.response;
            })
        );
    }

    getActiveChannelId(): Observable<string> {
        return this.sharedPreferences.getString(FrameworkServiceImpl.KEY_ACTIVE_CHANNEL_ID).pipe(
            map((channelId: string | undefined) => {
                if (!channelId) {
                    throw new NoActiveChannelFoundError('No Active channel ID set in preferences');
                }

                return channelId;
            })
        );
    }

    setActiveChannelId(channelId: string): Observable<undefined> {
        this._activeChannelId = channelId;
        if (CsModule.instance.isInitialised) {
            CsModule.instance.updateConfig({
                ...CsModule.instance.config,
                core: {
                    ...CsModule.instance.config.core,
                    global: {
                        ...CsModule.instance.config.core.global,
                        channelId
                    }
                }
            });
        }
        return this.sharedPreferences.putString(FrameworkServiceImpl.KEY_ACTIVE_CHANNEL_ID, channelId);
    }
}
