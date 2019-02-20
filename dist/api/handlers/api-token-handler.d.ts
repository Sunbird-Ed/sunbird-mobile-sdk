import { ApiConfig } from '..';
import { Observable } from 'rxjs';
import { Connection } from '../def/connection';
import { DeviceInfo } from '../../util/device/def/device-info';
export declare class ApiTokenHandler {
    private config;
    private connection;
    private deviceInfo;
    private static readonly VERSION;
    private static readonly ID;
    constructor(config: ApiConfig, connection: Connection, deviceInfo: DeviceInfo);
    refreshAuthToken(): Observable<string>;
    private getMobileDeviceConsumerKey;
    private buildGetMobileDeviceConsumerSecretAPIRequest;
    private getMobileDeviceConsumerSecret;
    private generateMobileAppConsumerBearerToken;
}
