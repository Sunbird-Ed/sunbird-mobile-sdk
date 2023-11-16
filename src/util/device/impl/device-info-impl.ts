import {DeviceInfo, DeviceSpec, StorageVolume} from '..';
import * as SHA1 from 'crypto-js/sha1';
import {Observable, of} from 'rxjs';
import {injectable} from 'inversify';
import {StorageDestination} from '../../../storage';
import {distinctUntilChanged, finalize, tap} from 'rxjs/operators';

@injectable()
export class DeviceInfoImpl implements DeviceInfo {

    private readonly deviceId: string;
    private deviceSpec: DeviceSpec;

    constructor() {
        let uuid = "";
        window['Capacitor']['Plugins'].Device.getId().then((val) => {
            uuid = val.identifier
        })
        this.deviceId = SHA1(uuid).toString();
    }

    getDeviceID(): string {
        return this.deviceId;
    }

    getDeviceSpec(): Observable<DeviceSpec> {
        if (this.deviceSpec) {
            return of(this.deviceSpec);
        }
        return new Observable((observer) => {
            sbutility.getDeviceSpec((deviceSpec: DeviceSpec) => {
                this.deviceSpec = deviceSpec;
                observer.next(deviceSpec);
                observer.complete();
            });
        });
    }

    getAvailableInternalMemorySize(): Observable<string> {
        return new Observable((observer) => {
            sbutility.getAvailableInternalMemorySize((value) => {
                observer.next(value);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

    getStorageVolumes(): Observable<StorageVolume[]> {
        return Observable.create((observer) => {
            sbutility.getStorageVolumes((volumes) => {
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

    isKeyboardShown(): Observable<boolean> {
        let shownCallback1;
        let shownCallback2;

        let hideCallback1;
        let hideCallback2;

        return new Observable<boolean>((observer) => {
            shownCallback1 = () => observer.next(true);
            shownCallback2 = () => observer.next(true);
            hideCallback1 = () => observer.next(false);
            hideCallback2 = () => observer.next(false);

            window.addEventListener('native.keyboardshow', shownCallback1);
            window.addEventListener('keyboardWillShow', shownCallback2);

            window.addEventListener('native.keyboardhide', hideCallback1);
            window.addEventListener('keyboardWillHide', hideCallback1);
        })
            .pipe(
                distinctUntilChanged(),
                tap(() => {
                    console.log('Subscribed isKeyboardShown event');
                }),
                finalize(() => {
                    console.log('Unsubscribed isKeyboardShown event');

                    window.removeEventListener('native.keyboardshow', shownCallback1);
                    window.removeEventListener('keyboardWillShow', shownCallback2);

                    window.removeEventListener('native.keyboardhide', hideCallback1);
                    window.removeEventListener('keyboardWillHide', hideCallback1);
                })
            );
    }
}
