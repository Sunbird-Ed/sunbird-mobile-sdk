import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfo} from '../def/tenant-info';
import {KeyValueStore} from '../../key-value-store';
import {TenantServiceConfig} from '../config/tenant-service-config';
import {SessionAuthenticator} from '../../auth';
import {Observable} from 'rxjs';

export class TenantInfoHandler implements ApiRequestHandler<TenantInfoRequest, TenantInfo[]> {
    private readonly GET_TENANT_INFO_ENDPOINT = '/v1/tenant/info/';
    private readonly STORED_TENANT_INFO_PREFIX = 'tenantInfo_';

    constructor(private keyValueStore: KeyValueStore,
                private apiService: ApiService,
                private tenantServiceConfig: TenantServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    handle(request: TenantInfoRequest): Observable<TenantInfo[]> {
        return this.keyValueStore.getValue(this.STORED_TENANT_INFO_PREFIX + request._slug)
            .mergeMap((tenantInfo: string | undefined) => {
                if (tenantInfo) {
                    return Observable.of(JSON.parse(tenantInfo));
                }
                return this.fetchFromServe(request)
                    .do((tenant: TenantInfo[]) => {
                        this.keyValueStore.setValue(this.STORED_TENANT_INFO_PREFIX + request._slug, JSON.stringify(tenant));
                    });
            });
    }

    private fetchFromServe(request: TenantInfoRequest): Observable<TenantInfo[]> {
        const apiRequest: Request = new Request.Builder().withType(HttpRequestType.GET)
            .withPath(this.tenantServiceConfig.apiPath + this.GET_TENANT_INFO_ENDPOINT + request._slug)
            .withApiToken(true)
            .withInterceptors([this.sessionAuthenticator])
            .build();
        return this.apiService.fetch <{ result: TenantInfo[] }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
