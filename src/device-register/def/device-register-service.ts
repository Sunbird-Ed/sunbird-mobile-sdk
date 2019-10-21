import {DeviceRegisterRequest} from './request';
import {Observable} from 'rxjs';

export interface DeviceRegisterService {
    registerDevice(request?: DeviceRegisterRequest): Observable<DeviceRegisterResponse>;
}
