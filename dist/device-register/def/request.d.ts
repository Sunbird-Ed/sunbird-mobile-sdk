import { DeviceSpec } from '../../util/device';
export interface UserDeclaredLocation {
    declaredOffline?: boolean;
    state: string;
    stateId?: string;
    district: string;
    districtId?: string;
}
export interface DeviceRegisterRequest {
    dspec?: DeviceSpec;
    channel?: string;
    fcmToken?: string;
    producer?: string;
    first_access?: number;
    userDeclaredLocation?: UserDeclaredLocation;
}
