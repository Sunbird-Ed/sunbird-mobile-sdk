import { ApiConfig } from './config/api-config';
import { Request } from './def/request';
import { Response } from './def/response';
import { Observable } from 'rxjs';
import { ApiService } from './def/api-service';
import { DeviceInfo } from '../util/device/def/device-info';
export declare class ApiServiceImpl implements ApiService {
    private apiConfig;
    private deviceInfo;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo);
    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    fetch<T = any>(request: Request): Observable<Response<T>>;
}
