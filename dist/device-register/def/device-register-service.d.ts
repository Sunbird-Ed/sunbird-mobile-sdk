import { DeviceRegisterRequest } from './request';
import { Observable } from 'rxjs';
import { DeviceRegisterResponse } from './response';
export interface DeviceRegisterService {
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
}
