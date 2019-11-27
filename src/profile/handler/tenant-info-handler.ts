import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {TenantInfo} from '../def/tenant-info';
import {ProfileServiceConfig} from '..';
import {TenantInfoRequest} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class TenantInfoHandler implements ApiRequestHandler<TenantInfoRequest, TenantInfo> {
    private readonly GET_TENANT_INFO_ENDPOINT = '/info';

    constructor(private apiService: ApiService,
                private tenantServiceConfig: ProfileServiceConfig) {
    }

    public handle(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        const apiRequest: Request = new Request.Builder().withType(HttpRequestType.GET)
            .withPath(this.tenantServiceConfig.tenantApiPath + this.GET_TENANT_INFO_ENDPOINT + '/' + tenantInfoRequest.slug)
            .build();
        return this.apiService.fetch <{ result: TenantInfo }>(apiRequest).pipe(
            map((success) => {
                return success.body.result;
            })
        );
    }
}
