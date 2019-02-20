import {DeviceInfo} from '../def/device-info';
import * as SHA1 from 'crypto-js/sha1';

declare const device: {
    uuid: string;
};

export class DeviceInfoImpl implements DeviceInfo {

    private deviceId: string;

    getDeviceID(): string {
        return this.deviceId ? this.deviceId : SHA1(device.uuid);
    }

}
