import { Request, Response } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
import { SharedPreferences } from '../../util/shared-preferences';
import { Authenticator } from '../def/authenticator';
import { SdkConfig } from '../../sdk-config';
export declare class FetchHandler {
    private request;
    private sdkConfig;
    private deviceInfo;
    private sharedPreferences;
    private defaultApiAuthenticators;
    private defaultSessionAuthenticators;
    private baseConnection;
    constructor(request: Request, sdkConfig: SdkConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, defaultApiAuthenticators: Authenticator[], defaultSessionAuthenticators: Authenticator[]);
    doFetch(): Observable<Response>;
}
