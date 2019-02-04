import { ApiConfig, Connection } from '..';
import { Observable } from 'rxjs';
export declare class ApiTokenHandler {
    private static readonly VERSION;
    private static readonly ID;
    private config;
    constructor(config: ApiConfig);
    refreshAuthToken(connection: Connection): Observable<string>;
    private getMobileDeviceConsumerKey;
    private buildGetMobileDeviceConsumerSecretAPIRequest;
    private getMobileDeviceConsumerSecret;
    private generateMobileAppConsumerBearerToken;
}
