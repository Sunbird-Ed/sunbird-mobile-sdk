import { ApiRequestHandler, ApiService } from '../../api';
import { TenantInfo } from '../def/tenant-info';
import { ProfileServiceConfig } from '..';
import { Observable } from 'rxjs';
export declare class TenantInfoHandler implements ApiRequestHandler<undefined, TenantInfo> {
    private apiService;
    private tenantServiceConfig;
    private readonly GET_TENANT_INFO_ENDPOINT;
    constructor(apiService: ApiService, tenantServiceConfig: ProfileServiceConfig);
    handle(): Observable<TenantInfo>;
}
