import { ApiRequestHandler, ApiService } from '../../api';
import { TenantInfoRequest } from '../def/tenant-info-request';
import { TenantInfo } from '../def/tenant-info';
import { ProfileServiceConfig } from '../config/profile-service-config';
import { SessionAuthenticator } from '../../auth';
import { Observable } from 'rxjs';
export declare class TenantInfoHandler implements ApiRequestHandler<TenantInfoRequest, TenantInfo> {
    private apiService;
    private tenantServiceConfig;
    private sessionAuthenticator;
    private readonly GET_TENANT_INFO_ENDPOINT;
    constructor(apiService: ApiService, tenantServiceConfig: ProfileServiceConfig, sessionAuthenticator: SessionAuthenticator);
    handle(request: TenantInfoRequest): Observable<TenantInfo>;
}
