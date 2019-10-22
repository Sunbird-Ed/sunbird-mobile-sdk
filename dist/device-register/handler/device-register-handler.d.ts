import { ApiRequestHandler, ApiService } from '../../api';
import { DeviceRegisterRequest, DeviceRegisterResponse } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
import { AppInfo } from '../../util/app';
import { KeyValueStore } from '../../key-value-store';
import { SdkConfig } from '../../sdk-config';
import { SharedPreferences } from '../../util/shared-preferences';
import { FrameworkService } from '../../framework';
export declare class DeviceRegisterHandler implements ApiRequestHandler<DeviceRegisterRequest, DeviceRegisterResponse> {
    private sdkConfig;
    private deviceInfo;
    private frameworkService;
    private appInfoService;
    private keyValueStore;
    private sharedPreferences;
    private apiService;
    private static readonly DEVICE_REGISTER_ENDPOINT;
    private readonly deviceRegisterConfig;
    private readonly apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, frameworkService: FrameworkService, appInfoService: AppInfo, keyValueStore: KeyValueStore, sharedPreferences: SharedPreferences, apiService: ApiService);
    handle(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
    private registerDevice;
}
