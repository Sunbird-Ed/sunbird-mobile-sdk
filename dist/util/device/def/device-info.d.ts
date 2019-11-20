import { Observable } from 'rxjs';
import { StorageDestination } from '../../../storage';
export interface DeviceSpec {
    idisk: number;
    cap: any[];
    mem: number;
    os: string;
    cpu: string;
    scrn: number;
    sims: number;
    id: string;
    camera: string;
    edisk: number;
    make: string;
}
export interface StorageVolume {
    storageDestination: StorageDestination;
    info: {
        availableSize: number;
        totalSize: string;
        state: string;
        path: string;
        contentStoragePath: string;
        isRemovable: boolean;
    };
}
export interface DeviceInfo {
    getDeviceID(): string;
    getDeviceSpec(): Observable<DeviceSpec>;
    getAvailableInternalMemorySize(): Observable<string>;
    getStorageVolumes(): Observable<StorageVolume[]>;
    isKeyboardShown(): Observable<boolean>;
}
