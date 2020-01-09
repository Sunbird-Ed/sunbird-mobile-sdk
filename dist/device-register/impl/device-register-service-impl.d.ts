import { DeviceProfileResponse, DeviceRegisterRequest, DeviceRegisterResponse, DeviceRegisterService } from '..';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { ApiService } from '../../api';
import { FrameworkService } from '../../framework';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class DeviceRegisterServiceImpl implements DeviceRegisterService {
    private sdkConfig;
    private deviceInfo;
    private sharedPreferences;
    private frameworkService;
    private appInfoService;
    private apiService;
    private readonly deviceRegisterHandler;
    private readonly getDeviceProfileHandler;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, sharedPreferences: SharedPreferences, frameworkService: FrameworkService, appInfoService: AppInfo, apiService: ApiService);
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
    getDeviceProfile(): Observable<DeviceProfileResponse>;
}
