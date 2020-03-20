import { ApiConfig, HttpClient, Request, Response } from '..';
import { Connection } from '../def/connection';
import { Authenticator } from '../def/authenticator';
import { DeviceInfo } from '../../util/device';
import { SharedPreferences } from '../../util/shared-preferences';
import { Observable } from 'rxjs';
export declare class BaseConnection implements Connection {
    protected http: HttpClient;
    protected apiConfig: ApiConfig;
    protected deviceInfo: DeviceInfo;
    protected sharedPreferences: SharedPreferences;
    protected defaultApiAuthenticators: Authenticator[];
    protected defaultSessionAuthenticators: Authenticator[];
    constructor(http: HttpClient, apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, defaultApiAuthenticators: Authenticator[], defaultSessionAuthenticators: Authenticator[]);
    invoke(request: Request): Observable<Response>;
    protected addGlobalHeader(): void;
    private buildInterceptorsFromAuthenticators;
    private interceptRequest;
    private interceptResponse;
}
