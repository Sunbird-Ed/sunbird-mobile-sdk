import { ApiConfig } from './config/api-config';
import { Request } from './def/request';
import { Response } from './def/response';
import { Observable } from 'rxjs';
import { ApiService } from './def/api-service';
export declare class ApiServiceImpl implements ApiService {
    private apiConfig;
    constructor(apiConfig: ApiConfig);
    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    fetch<T = any>(request: Request): Observable<Response<T>>;
}
