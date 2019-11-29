import { ApiRequestHandler, ApiService } from '../../api';
import { TenantInfo } from '../def/tenant-info';
import { ProfileServiceConfig } from '..';
import { TenantInfoRequest } from '..';
import { Observable } from 'rxjs';
export declare class TenantInfoHandler implements ApiRequestHandler<TenantInfoRequest, TenantInfo> {
    private apiService;
    private tenantServiceConfig;
    private readonly GET_TENANT_INFO_ENDPOINT;
    constructor(apiService: ApiService, tenantServiceConfig: ProfileServiceConfig);
    handle(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo>;
}
