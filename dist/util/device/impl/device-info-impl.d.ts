import { DeviceInfo, DeviceSpec, StorageVolume } from '..';
import { SdkConfig } from '../../../sdk-config';
import { Observable } from 'rxjs';
export declare class DeviceInfoImpl implements DeviceInfo {
    private sdkConfig;
    private readonly deviceId;
    private deviceSpec;
    constructor(sdkConfig: SdkConfig);
    getDeviceID(): string;
    getDeviceSpec(): Observable<DeviceSpec>;
    getAvailableInternalMemorySize(): Observable<string>;
    getStorageVolumes(): Observable<StorageVolume[]>;
    isKeyboardShown(): Observable<boolean>;
}
