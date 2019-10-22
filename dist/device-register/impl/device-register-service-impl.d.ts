import { DeviceRegisterService } from '../def/device-register-service';
import { DeviceProfileResponse, DeviceRegisterRequest, DeviceRegisterResponse } from '..';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { ApiService } from '../../api';
import { FrameworkService } from '../../framework';
export declare class DeviceRegisterServiceImpl implements DeviceRegisterService {
    private sdkConfig;
    private deviceInfo;
    private frameworkService;
    private appInfoService;
    private apiService;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, frameworkService: FrameworkService, appInfoService: AppInfo, apiService: ApiService);
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
    getDeviceProfile(): Observable<DeviceProfileResponse>;
}
