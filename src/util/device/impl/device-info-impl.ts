import {DeviceInfo} from '../def/device-info';
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

    getAvailableInternalMemorySize(): Observable<string> {
        return Observable.create((observer) => {
            buildconfigreader.getAvailableInternalMemorySize((value) => {
                observer.next(value);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

}
