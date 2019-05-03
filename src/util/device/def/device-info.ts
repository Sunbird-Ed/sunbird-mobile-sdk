import {Observable} from 'rxjs';

export interface  DeviceInfo {

    getDeviceID(): string;

    getAvailableInternalMemorySize(): Observable<string>;
}
