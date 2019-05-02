import {Observable} from 'rxjs';

export interface  DeviceInfo {
    getDeviceID(): string;

    getDeviceSpec(): Observable<DeviceSpec>;
}
