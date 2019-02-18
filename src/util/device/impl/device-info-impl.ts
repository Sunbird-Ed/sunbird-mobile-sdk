import {DeviceInfo} from '../def/device-info';
import * as SHA1 from 'crypto-js/sha1';

declare var UniqueDeviceID: {
    get(): Promise<string>;
};

export class DeviceInfoImpl implements DeviceInfo {
    getDeviceID(): string {
        return SHA1(UniqueDeviceID.get());
    }

}
