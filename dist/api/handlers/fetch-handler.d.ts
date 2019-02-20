import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device/def/device-info';
export declare class FetchHandler {
    private request;
    private apiConfig;
    private deviceInfo;
    private baseConnection;
    constructor(request: Request, apiConfig: ApiConfig, deviceInfo: DeviceInfo);
    doFetch(): Observable<Response>;
}
