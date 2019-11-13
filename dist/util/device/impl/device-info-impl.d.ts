import { DeviceInfo, DeviceSpec, StorageVolume } from '..';
import { Observable } from 'rxjs';
export declare class DeviceInfoImpl implements DeviceInfo {
    private readonly deviceId;
    private deviceSpec;
    constructor();
    getDeviceID(): string;
    getDeviceSpec(): Observable<DeviceSpec>;
    getAvailableInternalMemorySize(): Observable<string>;
    getStorageVolumes(): Observable<StorageVolume[]>;
    isKeyboardShown(): Observable<boolean>;
}
