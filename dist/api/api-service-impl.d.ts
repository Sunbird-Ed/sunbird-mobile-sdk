import { Request } from './def/request';
import { Response } from './def/response';
import { Observable } from 'rxjs';
import { ApiService } from './def/api-service';
import { DeviceInfo } from '../util/device';
import { SharedPreferences } from '../util/shared-preferences';
import { Authenticator } from './def/authenticator';
import { SdkConfig } from '../sdk-config';
import { EventsBusService } from '../events-bus';
export declare class ApiServiceImpl implements ApiService {
    private sdkConfig;
    private deviceInfo;
    private sharedPreferences;
    private eventsBusService;
    private defaultApiAuthenticators;
    private defaultSessionAuthenticators;
    private apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, eventsBusService: EventsBusService);
    onInit(): Observable<undefined>;
    fetch<T = any>(request: Request): Observable<Response<T>>;
    setDefaultApiAuthenticators(authenticators: Authenticator[]): void;
    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void;
}
