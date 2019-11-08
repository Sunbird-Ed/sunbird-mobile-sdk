import { ApiRequestHandler, ApiService } from '../../api';
import { DeviceRegisterRequest, DeviceRegisterResponse } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { SdkConfig } from '../../sdk-config';
import { FrameworkService } from '../../framework';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class DeviceRegisterHandler implements ApiRequestHandler<DeviceRegisterRequest, DeviceRegisterResponse> {
    private sdkConfig;
    private deviceInfo;
    private sharedPreferences;
    private frameworkService;
    private appInfoService;
    private apiService;
    private static readonly DEVICE_REGISTER_ENDPOINT;
    private readonly deviceRegisterConfig;
    private readonly apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, frameworkService: FrameworkService, appInfoService: AppInfo, apiService: ApiService);
    handle(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
    private registerDevice;
}
