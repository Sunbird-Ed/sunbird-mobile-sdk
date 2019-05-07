import { Observable } from 'rxjs';
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
export interface DeviceInfo {
    getDeviceID(): string;
    getDeviceSpec(): Observable<DeviceSpec>;
    getAvailableInternalMemorySize(): Observable<string>;
}
