import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Authenticator } from '../def/authenticator';
import { Connection } from '../def/connection';
import { DeviceInfo } from '../../util/device/def/device-info';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class ApiAuthenticator implements Authenticator {
    private sharedPreferences;
    private apiConfig;
    private deviceInfo;
    private connection;
    private apiTokenHandler;
    constructor(sharedPreferences: SharedPreferences, apiConfig: ApiConfig, deviceInfo: DeviceInfo, connection: Connection);
    interceptRequest(request: Request): Observable<Request>;
    interceptResponse(request: Request, response: Response): Observable<Response>;
}
