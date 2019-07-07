import {DeviceInfo, DeviceSpec, StorageVolume} from '..';
import * as SHA1 from 'crypto-js/sha1';
import {Environments, SdkConfig, StorageDestination} from '../../..';
import {Observable} from 'rxjs';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';

declare const device: {
    uuid: string;
};

@injectable()
export class DeviceInfoImpl implements DeviceInfo {

    private readonly deviceId: string;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        if (sdkConfig.environment === Environments.ELECTRON) {
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
        if (this.sdkConfig.environment === Environments.ANDROID) {
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

        return Observable.of([{
            storageDestination: StorageDestination.INTERNAL_STORAGE,
            info: {
                availableSize: 9999,
                totalSize: '9999',
                state: '',
                path: './',
                contentStoragePath: '',
                isRemovable: false
            }
        }]);
    }
}
