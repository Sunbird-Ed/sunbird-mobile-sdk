import { ApiConfig, HttpClient, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Connection } from '../def/connection';
import { DeviceInfo } from '../../util/device/def/device-info';
export declare class BaseConnection implements Connection {
    protected http: HttpClient;
    protected apiConfig: ApiConfig;
    protected deviceInfo: DeviceInfo;
    constructor(http: HttpClient, apiConfig: ApiConfig, deviceInfo: DeviceInfo);
    invoke(request: Request): Observable<Response>;
    protected addGlobalHeader(): void;
    private buildInterceptorsFromAuthenticators;
    private interceptRequest;
    private interceptResponse;
}
