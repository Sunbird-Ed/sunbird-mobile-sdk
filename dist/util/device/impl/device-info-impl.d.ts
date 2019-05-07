import { DeviceInfo, DeviceSpec } from '../def/device-info';
import { SdkConfig } from '../../../sdk-config';
import { Observable } from 'rxjs';
export declare class DeviceInfoImpl implements DeviceInfo {
    private sdkConfig;
    private readonly deviceId;
    constructor(sdkConfig: SdkConfig);
    getDeviceID(): string;
    getDeviceSpec(): Observable<DeviceSpec>;
    getAvailableInternalMemorySize(): Observable<string>;
}
