import { ApiConfig } from '..';
import { Observable } from 'rxjs';
import { Connection } from '../def/connection';
export declare class ApiTokenHandler {
    private config;
    private connection;
    private static readonly VERSION;
    private static readonly ID;
    constructor(config: ApiConfig, connection: Connection);
    refreshAuthToken(): Observable<string>;
    private getMobileDeviceConsumerKey;
    private buildGetMobileDeviceConsumerSecretAPIRequest;
    private getMobileDeviceConsumerSecret;
    private generateMobileAppConsumerBearerToken;
}
