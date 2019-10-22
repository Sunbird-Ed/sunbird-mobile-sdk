import { DeviceRegisterService } from '../def/device-register-service';
import { DeviceRegisterRequest, DeviceRegisterResponse } from '..';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { KeyValueStore } from '../../key-value-store';
import { ApiService } from '../../api';
import { SharedPreferences } from '../../util/shared-preferences';
import { FrameworkService } from '../../framework';
export declare class DeviceRegisterServiceImpl implements DeviceRegisterService {
    private sdkConfig;
    private deviceInfo;
    private frameworkService;
    private appInfoService;
    private keyValueStore;
    private sharedPreferences;
    private apiService;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, frameworkService: FrameworkService, appInfoService: AppInfo, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences, apiService: ApiService);
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
}
