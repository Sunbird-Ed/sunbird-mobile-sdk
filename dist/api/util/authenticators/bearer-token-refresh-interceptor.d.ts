import { ApiConfig, ApiService } from '../..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../../util/device';
import { SharedPreferences } from '../../../util/shared-preferences';
import { CsRequest, CsResponse, CsResponseInterceptor } from '@project-sunbird/client-services/core/http-service';
export declare class BearerTokenRefreshInterceptor implements CsResponseInterceptor {
    private sharedPreferences;
    private apiConfig;
    private deviceInfo;
    private apiService;
    private apiTokenHandler;
    constructor(sharedPreferences: SharedPreferences, apiConfig: ApiConfig, deviceInfo: DeviceInfo, apiService: ApiService);
    interceptResponse(request: CsRequest, response: CsResponse): Observable<CsResponse>;
}
