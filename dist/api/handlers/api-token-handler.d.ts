import { ApiConfig, ApiService } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
export declare class ApiTokenHandler {
    private config;
    private apiService;
    private deviceInfo;
    private static readonly VERSION;
    private static readonly ID;
    constructor(config: ApiConfig, apiService: ApiService, deviceInfo: DeviceInfo);
    refreshAuthToken(): Observable<string>;
    private getMobileDeviceConsumerKey;
    private buildGetMobileDeviceConsumerSecretAPIRequest;
    private getBearerTokenFromKongV2;
    private getBearerTokenFromFallback;
    private generateMobileAppConsumerBearerToken;
}
