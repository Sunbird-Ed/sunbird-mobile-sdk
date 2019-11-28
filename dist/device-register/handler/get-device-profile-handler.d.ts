import { ApiRequestHandler, ApiService } from '../../api';
import { DeviceProfileResponse } from '..';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../../util/device';
import { SdkConfig } from '../../sdk-config';
export declare class GetDeviceProfileHandler implements ApiRequestHandler<undefined, DeviceProfileResponse> {
    private sdkConfig;
    private deviceInfo;
    private apiService;
    private static readonly GET_DEVICE_PROFILE_ENDPOINT;
    private readonly deviceRegisterConfig;
    private readonly apiConfig;
    constructor(sdkConfig: SdkConfig, deviceInfo: DeviceInfo, apiService: ApiService);
    handle(): Observable<DeviceProfileResponse>;
    fetchFromServer(): Observable<DeviceProfileResponse>;
}
