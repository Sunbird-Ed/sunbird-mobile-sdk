import { ApiConfig } from './config/api-config';
import { Request } from './def/request';
import { Response } from './def/response';
import { Observable } from 'rxjs';
import { ApiService } from './def/api-service';
import { DeviceInfo } from '../util/device';
import { SharedPreferences } from '../util/shared-preferences';
import { Authenticator } from './def/authenticator';
export declare class ApiServiceImpl implements ApiService {
    private apiConfig;
    private deviceInfo;
    private sharedPreferences;
    private defaultApiAuthenticators;
    private defaultSessionAuthenticators;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences);
    fetch<T = any>(request: Request): Observable<Response<T>>;
    setDefaultApiAuthenticators(authenticators: Authenticator[]): void;
    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void;
}
