import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TenantInfo} from '../def/tenant-info';
import {ProfileServiceConfig} from '..';
import {Observable} from 'rxjs';

export class TenantInfoHandler implements ApiRequestHandler<undefined, TenantInfo> {
    private readonly GET_TENANT_INFO_ENDPOINT = '/info';

    constructor(private apiService: ApiService,
                private tenantServiceConfig: ProfileServiceConfig) {
    }

    public handle(): Observable<TenantInfo> {
        const apiRequest: Request = new Request.Builder().withType(HttpRequestType.GET)
            .withPath(this.tenantServiceConfig.tenantApiPath + this.GET_TENANT_INFO_ENDPOINT)
            .build();
        return this.apiService.fetch <{ result: TenantInfo }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }
}
