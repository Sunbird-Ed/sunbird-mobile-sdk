import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TenantInfoRequest} from '../def/tenant-info-request';
import {TenantInfo} from '../def/tenant-info';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';

export class TenantInfoHandler implements ApiRequestHandler<TenantInfoRequest, TenantInfo> {
    private readonly GET_TENANT_INFO_ENDPOINT = '/api/tenant/info';

    constructor(private apiService: ApiService,
                private tenantServiceConfig: ProfileServiceConfig) {
    }

    public handle(request: TenantInfoRequest): Observable<TenantInfo> {
        const apiRequest: Request = new Request.Builder().withType(HttpRequestType.GET)
            .withPath(this.tenantServiceConfig.apiPath + this.GET_TENANT_INFO_ENDPOINT + request.slug)
            .withApiToken(true)
            .withSessionToken(true)
            .build();
        return this.apiService.fetch <{ result: TenantInfo }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
