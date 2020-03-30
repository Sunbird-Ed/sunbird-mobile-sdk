import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {PageAssemble, PageAssembleCriteria, PageName, PageServiceConfig} from '..';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../key-value-store';
import {defer, Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';
import {SharedPreferences} from '../../util/shared-preferences';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {AuthService} from '../../auth';
import {FrameworkService} from '../../framework';
import {SystemSettingsService} from '../../system-settings';

export class PageAssemblerHandler implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private static readonly SSO_COURSE_SECTION_ID = 'ssoCourseSection';
    private readonly PAGE_ASSEMBLE_LOCAL_KEY = 'page_assemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINT = '/page/assemble?orgdetails=orgName';
    private readonly DIALCODE_ASSEMBLE_ENDPOINT = '/dial/assemble';

    private ssoSectionIdMap = new Map<string, string>();

    constructor(private apiService: ApiService,
                private pageApiServiceConfig: PageServiceConfig,
                private cachedItemStore: CachedItemStore,
                private keyValueStore: KeyValueStore,
                private sharedPreferences: SharedPreferences,
                private frameworkService: FrameworkService,
                private authService: AuthService,
                private systemSettingsService: SystemSettingsService
    ) {
    }

    private static getIdForDb(request: PageAssembleCriteria): string {
        const key = request.name +
            (request.source || 'app') +
            (request.mode || '') +
            (request.filters ? SHA1(JSON.stringify(request.filters)).toString() : '') +
            (request.sections ? SHA1(JSON.stringify(request.sections)).toString() : '');
        return key;
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        request.from = request.from || CachedItemRequestSourceFrom.CACHE;

        return defer(async () => {
            const isProfileLoggedIn = !!(await this.authService.getSession().toPromise());

            if (
                request.name === PageName.COURSE &&
                isProfileLoggedIn
            ) {
                const defaultChannelId = await this.frameworkService.getDefaultChannelId().toPromise();
                const activeChannelId = this.frameworkService.activeChannelId!;
                const isDefaultChannelProfile = activeChannelId === defaultChannelId;

                if (!isDefaultChannelProfile) {
                    let sectionId: string | undefined;

                    try {
                        const res = await this.systemSettingsService.getSystemSettings({
                            id: PageAssemblerHandler.SSO_COURSE_SECTION_ID
                        }).toPromise();

                        sectionId = res && res.value;
                    } catch (e) {
                        console.error(e);
                    }

                    if (sectionId) {
                        request.sections = {
                            [sectionId]: {
                                filters: {
                                    'batches.createdFor': [activeChannelId],
                                    ...request.filters
                                }
                            }
                        };

                        this.ssoSectionIdMap.set(request.name + '-' + activeChannelId, sectionId);
                    }
                }
            }
        }).pipe(
            mergeMap(() => {
                if (request.from === CachedItemRequestSourceFrom.SERVER) {
                    return this.fetchFromServer(request).pipe(
                        catchError(() => {
                            return this.fetchFromCache(request);
                        })
                    );
                }

                return this.fetchFromCache(request);
            }),
            map((response) => {
                const ssoPageSectionId = this.ssoSectionIdMap.get(request.name + '-' + this.frameworkService.activeChannelId);

                if (ssoPageSectionId) {
                    response.ssoSectionId = ssoPageSectionId;
                }

                return response;
            })
        );
    }

    private fetchFromServer(request: PageAssembleCriteria): Observable<PageAssemble> {

        const pageAssembleEndPoint = request.name === PageName.DIAL_CODE ? this.DIALCODE_ASSEMBLE_ENDPOINT : this.PAGE_ASSEMBLE_ENDPOINT;

        const apiRequest: Request = new Request.Builder()
            .withHost(this.pageApiServiceConfig.host)
            .withType(HttpRequestType.POST)
            .withPath(this.pageApiServiceConfig.apiPath + pageAssembleEndPoint)
            .withApiToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch<{ result: { response: PageAssemble } }>(apiRequest).pipe(
            map((success) => {
                return success.body.result.response;
            }),
            tap((pageAssembleRes) => {
                const pageAssemble = JSON.stringify(pageAssembleRes);

                this.sharedPreferences.putString(
                    ('ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + PageAssemblerHandler.getIdForDb(request)), Date.now() + ''
                ).toPromise();

                this.keyValueStore.setValue(
                    this.PAGE_ASSEMBLE_LOCAL_KEY + '-' + PageAssemblerHandler.getIdForDb(request), pageAssemble
                ).toPromise();
            }),
        );
    }

    private fetchFromCache(request: PageAssembleCriteria): Observable<PageAssemble> {
        return this.cachedItemStore.getCached(
            PageAssemblerHandler.getIdForDb(request),
            this.PAGE_ASSEMBLE_LOCAL_KEY,
            'ttl_' + this.PAGE_ASSEMBLE_LOCAL_KEY,
            () => this.fetchFromServer(request)
        );
    }
}
