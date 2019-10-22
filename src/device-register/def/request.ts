import {DeviceSpec} from '../../util/device';

export interface DeviceRegisterRequest {
    dspec?: DeviceSpec;
    channel?: string;
    fcmToken?: string;
    producer?: string;
    first_access?: number;
    userDeclaredLocation?: {
        state: string;
        district: string;
    };
}
