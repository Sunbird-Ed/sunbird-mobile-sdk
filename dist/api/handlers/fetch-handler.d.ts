import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device/def/device-info';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class FetchHandler {
    private request;
    private apiConfig;
    private deviceInfo;
    private sharedPreferences;
    private baseConnection;
    constructor(request: Request, apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences);
    doFetch(): Observable<Response>;
}
