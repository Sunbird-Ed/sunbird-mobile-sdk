import {DeviceInfo} from '..';
import * as SHA1 from 'crypto-js/sha1';
import {SdkConfig} from '../../../sdk-config';
import {Observable} from 'rxjs';

declare const device: {
    uuid: string;
};

export class DeviceInfoImpl implements DeviceInfo {

    private readonly deviceId: string;

    constructor(private sdkConfig: SdkConfig) {
        if (sdkConfig.apiConfig.debugMode) {
            return this.deviceId = SHA1('4adce7fad56e02b7').toString();
        }

        this.deviceId = SHA1(device.uuid).toString();
    }

    getDeviceID(): string {
        return this.deviceId;
    }

    getDeviceSpec(): Observable<DeviceSpec> {
        return Observable.create((observer) => {
            buildconfigreader.getDeviceSpec((deviceSpec: DeviceSpec) => {
                observer.next(deviceSpec);
                observer.complete();
            });
        });
    }
}
