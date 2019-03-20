import { ApiConfig, HttpClient, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Connection } from '../def/connection';
import { DeviceInfo } from '../../util/device/def/device-info';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class BaseConnection implements Connection {
    protected http: HttpClient;
    protected apiConfig: ApiConfig;
    protected deviceInfo: DeviceInfo;
    protected sharedPreferences: SharedPreferences;
    constructor(http: HttpClient, apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences);
    invoke(request: Request): Observable<Response>;
    protected addGlobalHeader(): void;
    private buildInterceptorsFromAuthenticators;
    private interceptRequest;
    private interceptResponse;
    private handleByteArrayPost;
}
