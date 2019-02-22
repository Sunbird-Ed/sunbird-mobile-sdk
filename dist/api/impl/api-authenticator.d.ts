import { ApiConfig, Request, Response } from '..';
import { Observable } from 'rxjs';
import { Authenticator } from '../def/authenticator';
import { Connection } from '../def/connection';
import { DeviceInfo } from '../../util/device/def/device-info';
export declare class ApiAuthenticator implements Authenticator {
    private apiConfig;
    private deviceInfo;
    private connection;
    private apiTokenHandler;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo, connection: Connection);
    interceptRequest(request: Request): Request;
    interceptResponse(request: Request, response: Response): Observable<Response>;
}
