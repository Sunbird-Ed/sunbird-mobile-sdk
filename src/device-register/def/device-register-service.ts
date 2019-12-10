import {DeviceRegisterRequest} from './request';
import {Observable} from 'rxjs';
import {DeviceProfileResponse, DeviceRegisterResponse} from './response';

export interface DeviceRegisterService {
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;

    getDeviceProfile(): Observable<DeviceProfileResponse>;
}
