import { ApiConfig } from './config/api-config';
import { Request } from './def/request';
import { Response } from './def/response';
import { Observable } from 'rxjs';
import { ApiService } from './def/api-service';
import { DeviceInfo } from '../util/device/def/device-info';
import { SharedPreferences } from '../util/shared-preferences';
export declare class ApiServiceImpl implements ApiService {
    private apiConfig;
    private deviceInfo;
    private sharedPreferences;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences);
    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    fetch<T = any>(request: Request): Observable<Response<T>>;
}
