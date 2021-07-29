import { ApiConfig, ApiService, Request, Response } from '../../../api';
import { Observable } from 'rxjs';
import { Authenticator } from '../../../api/def/authenticator';
import { DeviceInfo } from '../../device';
import { SharedPreferences } from '../../shared-preferences';
export declare class ApiAuthenticator implements Authenticator {
    private sharedPreferences;
    private apiConfig;
    private deviceInfo;
    private apiService;
    private apiTokenHandler;
    constructor(sharedPreferences: SharedPreferences, apiConfig: ApiConfig, deviceInfo: DeviceInfo, apiService: ApiService);
    interceptRequest(request: Request): Observable<Request>;
    interceptResponse(request: Request, response: Response): Observable<Response>;
}
