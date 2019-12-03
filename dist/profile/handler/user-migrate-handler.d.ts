import { ApiRequestHandler, ApiService } from '../../api';
import { UserMigrateRequest } from '../def/user-migrate-request';
import { UserMigrateResponse } from '../def/user-migrate-response';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
export declare class UserMigrateHandler implements ApiRequestHandler<UserMigrateRequest, UserMigrateResponse> {
    private sdkConfig;
    private apiService;
    private static readonly USER_MIGRATE;
    private readonly apiConfig;
    private readonly profileServiceConfig;
    constructor(sdkConfig: SdkConfig, apiService: ApiService);
    handle(request: UserMigrateRequest): Observable<UserMigrateResponse>;
    fetchFromServer(request: any): Observable<UserMigrateResponse>;
}
