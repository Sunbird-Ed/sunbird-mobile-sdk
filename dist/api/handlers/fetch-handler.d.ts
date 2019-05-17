import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
import { SharedPreferences } from '../../util/shared-preferences';
import { Authenticator } from '../def/authenticator';
export declare class FetchHandler {
    private request;
    private apiConfig;
    private deviceInfo;
    private sharedPreferences;
    private defaultApiAuthenticators;
    private defaultSessionAuthenticators;
    private baseConnection;
    constructor(request: Request, apiConfig: ApiConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, defaultApiAuthenticators: Authenticator[], defaultSessionAuthenticators: Authenticator[]);
    doFetch(): Observable<Response>;
}
