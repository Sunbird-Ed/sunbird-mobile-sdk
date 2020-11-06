import {DeviceInfo, DeviceSpec, StorageVolume} from '..';

import {Observable, of} from 'rxjs';
import {injectable} from 'inversify';
import {StorageDestination} from '../../../storage';
import {distinctUntilChanged, finalize, tap} from 'rxjs/operators';
import {UniqueId} from '../../../db/util/unique-id';

@injectable()
export class DeviceInfoMockImpl implements DeviceInfo {

    private readonly deviceId: string = UniqueId.generateUniqueId();
    private deviceSpec: DeviceSpec;

    constructor() {
    }

    getDeviceID(): string {
        return this.deviceId;
    }

    getDeviceSpec(): Observable<DeviceSpec> {
        if (this.deviceSpec) {
            return of(this.deviceSpec);
        }
        return of({
            idisk: 0,
            cap: [],
            mem: 0,
            os: '',
            cpu: '',
            scrn: 1,
            sims: 1,
            id: '',
            camera: '',
            edisk: 0,
            make: '',
        });
    }

    getAvailableInternalMemorySize(): Observable<string> {
        return of('1gb');
    }

    getStorageVolumes(): Observable<StorageVolume[]> {
        return of([
            {
                storageDestination: StorageDestination.INTERNAL_STORAGE,
                info: {
                    availableSize: 0,
                    totalSize: '',
                    state: '',
                    path: '',
                    contentStoragePath: '',
                    isRemovable: false
                }
            }
        ]);
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
