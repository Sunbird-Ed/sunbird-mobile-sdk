import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../../api';
import {PageAssembleCriteria, PageName, PageServiceConfig} from '../..';
import {PageAssemble} from '../../index';
import {CachedItemRequestSourceFrom, CachedItemStore, KeyValueStore} from '../../../key-value-store';
import {catchError, map, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import * as SHA1 from 'crypto-js/sha1';
import {SharedPreferences} from '../../../util/shared-preferences';

export class DefaultRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private readonly PAGE_ASSEMBLE_LOCAL_KEY = 'page_assemble-';
    private readonly PAGE_ASSEMBLE_ENDPOINT = '/page/assemble?orgdetails=orgName';
    private readonly DIALCODE_ASSEMBLE_ENDPOINT = '/dial/assemble';

    private static getIdForDb(request: PageAssembleCriteria): string {
        const key = request.name +
            (request.source || 'app') +
            (request.mode || '') +
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
    ) {
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        if (request.from === CachedItemRequestSourceFrom.SERVER) {
            return this.fetchFromServer(request).pipe(
                catchError(() => {
                    return this.fetchFromCache(request);
                })
            );
        }

        return this.fetchFromCache(request);
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
