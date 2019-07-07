import {BuildConfigReader} from '..';
import {Observable, Observer} from 'rxjs';
import {injectable} from 'inversify';
import {PathKeys} from '../../../preference-keys';

@injectable()
export class ElectronBuildConfigReader implements BuildConfigReader {
    private fs;

    constructor() {
        this.fs = window['require']('fs');
    }

    canWrite(directory: string): Observable<string> {
        return Observable.of('true');
    }

    copyDirectory(sourceDirectory: string, destinationDirectory: string): Observable<void> {
        throw new Error('To be Implemented');
    }

    createDirectories(parentDirectoryPath: string, listOfFolder: string[]): Observable<void> {
        throw new Error('To be Implemented');
    }

    getAvailableInternalMemorySize(): Observable<string> {
        return Observable.of('99999999');
    }

    getBuildConfigValue(packageName: string, property: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.fs.readFile(localStorage.getItem(PathKeys.ROOT_DIR_KEY) + '/build-config-values.json', 'utf-8', (err, data) => {
                if (err) {
                    observer.error(err);
                    return;
                }

                observer.next(JSON.parse(data)[property]);
                observer.complete();
            });
        });
    }

    getBuildConfigValues(packageName: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.fs.readFile(localStorage.getItem(PathKeys.ROOT_DIR_KEY) + '/build-config-values.json', 'utf-8', (err, data) => {
                if (err) {
                    observer.error(err);
                    return;
                }

                observer.next(data);
                observer.complete();
            });
        });
    }

    getDeviceSpec(): Observable<any> {
        throw new Error('To be Implemented');
    }

    getFreeUsableSpace(directory: string): Observable<string> {
        throw new Error('To be Implemented');
    }

    getMetaData(fileMapList: any[]): Observable<any> {
        throw new Error('To be Implemented');
    }

    getStorageVolumes(): Observable<{ availableSize: number; totalSize: number; state: string; path: string; contentStoragePath: string; isRemovable: boolean }[]> {
        return Observable.of([
            {
                availableSize: 99999,
                totalSize: 99999,
                state: '',
                path: localStorage.getItem('data_dir')!,
                contentStoragePath: localStorage.getItem(PathKeys.ROOT_DIR_KEY) + '/contents',
                isRemovable: true
            }
        ]);
    }

    renameDirectory(sourceDirectory: string, toDirectoryName: string): Observable<void> {
        throw new Error('To be Implemented');
    }

    rm(directoryPath: string, directoryToBeSkipped: string): Observable<void> {
        throw new Error('To be Implemented');
    }

    writeFile(fileMapList: any[]): Observable<void> {
        throw new Error('To be Implemented');
    }

    checkAppAvailability(packageName: string): Observable<any> {
        throw new Error('To be Implemented');
    }

    clearUtmInfo(): Observable<any> {
        throw new Error('To be Implemented');
    }

    exportApk(): Observable<void> {
        throw new Error('To be Implemented');
    }

    getDeviceAPILevel(): Observable<any> {
        throw new Error('To be Implemented');
    }

    getDownloadDirectoryPath(): Observable<string> {
        throw new Error('To be Implemented');
    }

    getUtmInfo(): Observable<any> {
        throw new Error('To be Implemented');
    }

    openPlayStore(appId: string): Observable<void> {
        throw new Error('To be Implemented');
    }
}
