import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../../api';
import {PageAssembleCriteria, PageName, PageServiceConfig} from '../..';
import {PageAssemble} from '../../index';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../../key-value-store';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {defer, Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';
import {PageAssembleKeys} from '../../../preference-keys';
import {SharedPreferences} from '../../../util/shared-preferences';
import {AuthService} from '../../../auth';
import {ProfileService} from '../../../profile';
import {SystemSettingsService} from '../../../system-settings';

export class DefaultRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private readonly PAGE_ASSEMBLE_LOCAL_KEY = 'page_assemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINT = '/page/assemble?orgdetails=orgName';
    private readonly DIALCODE_ASSEMBLE_ENDPOINT = '/dial/assemble';
    private static readonly SYSTEM_SETTINGS_TENANT_COURSE_PAGE_ID = 'tenantCoursePage';

    private static getIdForDb(request: PageAssembleCriteria): string {
        const key =
            request.name + '-' +
            (request.organisationId || '') + '-' +
            (request.source || 'app') + '-' +
            (request.mode || '') + '-' +
            (request.filters ? SHA1(JSON.stringify(request.filters)).toString() : '') +
        (request.sections ? SHA1(JSON.stringify(request.sections)).toString() : '');
        return key;
    }

    constructor(
        private apiService: ApiService,
        private pageApiServiceConfig: PageServiceConfig,
        private sharedPreferences: SharedPreferences,
        private cachedItemStore: CachedItemStore,
        private keyValueStore: KeyValueStore,
        private authService: AuthService,
        private profileService: ProfileService,
        private systemSettingsService: SystemSettingsService    
    ) {
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        request.from = request.from || CachedItemRequestSourceFrom.CACHE;

        return defer(async () => {
            if (request.name !== PageName.COURSE) {
                return request;
            }

            const overriddenPageAssembleChannelId = await this.sharedPreferences.getString(PageAssembleKeys.KEY_ORGANISATION_ID).toPromise();

            if (!overriddenPageAssembleChannelId) {
                return request;
            }

            const isSsoUser = async () => {
                const isProfileLoggedIn = !!(await this.authService.getSession().toPromise());
                const isDefaultChannelProfile = await this.profileService.isDefaultChannelProfile().toPromise();

                return isProfileLoggedIn && !isDefaultChannelProfile;
            };

            if (await isSsoUser()) {
                return request;
            }

            const tenantCoursePageConfig: {
                channelId: string,
                page: PageName
            }[] = await this.systemSettingsService
                .getSystemSettings({id: DefaultRequestDelegate.SYSTEM_SETTINGS_TENANT_COURSE_PAGE_ID})
                .toPromise()
                .then((response) => {
                    try {
                        return JSON.parse(response.value);
                    } catch (e) {
                        console.error(e);
                        return [];
                    }
                });

            request.organisationId = overriddenPageAssembleChannelId;

            const overrideConfig = tenantCoursePageConfig
                .find((config) => config.channelId === overriddenPageAssembleChannelId);

            if (overrideConfig) {
                request.name = overrideConfig.page;
            }

            return request;
        }).pipe(
            mergeMap((adaptedRequest) => {
                if (adaptedRequest.from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(adaptedRequest).pipe(
                        catchError(() => {
                            return this.fetchFromCache(adaptedRequest);
                        })
                    );
                }

                return this.fetchFromCache(adaptedRequest);
            })
        );
    }

    private fetchFromServer(request: PageAssembleCriteria): Observable<PageAssemble> {

        const pageAssembleEndPoint = request.name === PageName.DIAL_CODE ? this.DIALCODE_ASSEMBLE_ENDPOINT : this.PAGE_ASSEMBLE_ENDPOINT;

        const apiRequest: Request = new Request.Builder()
            .withHost(this.pageApiServiceConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.pageApiServiceConfig.apiPath + pageAssembleEndPoint)
            .withBearerToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch<{ result: { response: PageAssemble } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response;
            }),
            tap((pageAssembleRes) => {
                const pageAssemble = JSON.stringify(pageAssembleRes);

                this.sharedPreferences.putString(
                    ('ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + DefaultRequestDelegate.getIdForDb(request)), Date.now() + ''
                ).toPromise();

                this.keyValueStore.setValue(
                    this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + DefaultRequestDelegate.getIdForDb(request), pageAssemble
                ).toPromise();
            }),
        );
    }

    private fetchFromCache(request: PageAssembleCriteria): Observable<PageAssemble> {
        return this.cachedItemStore.getCached(
            DefaultRequestDelegate.getIdForDb(request),
            this.PAGE_ASSEMBLE_LOCAL_KEY,
            'ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY,
            () => this.fetchFromServer(request)
        );
    }
}
