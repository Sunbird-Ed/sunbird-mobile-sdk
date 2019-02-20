import { DeviceInfo } from '../def/device-info';
import { SdkConfig } from '../../../sdk-config';
export declare class DeviceInfoImpl implements DeviceInfo {
    private sdkConfig;
    private readonly deviceId;
    constructor(sdkConfig: SdkConfig);
    getDeviceID(): string;
}
