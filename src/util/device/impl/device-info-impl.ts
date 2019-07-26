import {DeviceInfo, DeviceSpec, StorageVolume} from '..';
import * as SHA1 from 'crypto-js/sha1';
import {SdkConfig} from '../../../sdk-config';
import {Observable} from 'rxjs';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {StorageDestination} from '../../../storage';

declare const device: {
    uuid: string;
};

@injectable()
export class DeviceInfoImpl implements DeviceInfo {

    private readonly deviceId: string;
    private deviceSpec: DeviceSpec;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        if (this.sdkConfig.apiConfig.debugMode) {
            return this.deviceId = SHA1('4adce7fad56e02b7').toString();
        }

        this.deviceId = SHA1(device.uuid).toString();
    }

    getDeviceID(): string {
        return this.deviceId;
    }

    getDeviceSpec(): Observable<DeviceSpec> {
        if (this.deviceSpec) {
            return Observable.of(this.deviceSpec);
        }
        return Observable.create((observer) => {
            buildconfigreader.getDeviceSpec((deviceSpec: DeviceSpec) => {
                this.deviceSpec = deviceSpec;
                observer.next(deviceSpec);
                observer.complete();
            });
        });
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

    getStorageVolumes(): Observable<StorageVolume[]> {
        return Observable.create((observer) => {
            buildconfigreader.getStorageVolumes((volumes) => {
                observer.next(volumes.map((v) => {
                    if (v.isRemovable) {
                        return {
                            storageDestination: StorageDestination.EXTERNAL_STORAGE,
                            info: {...v}
                        };
                    }

                    return {
                        storageDestination: StorageDestination.INTERNAL_STORAGE,
                        info: {...v}
                    };
                }));
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }
}
