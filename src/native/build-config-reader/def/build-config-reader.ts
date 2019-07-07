import {Observable} from 'rxjs';
import {DeviceSpecification} from '../../../services/telemetry';

export interface BuildConfigReader {
    getBuildConfigValue(packageName: string, property: string): Observable<string>;

    getBuildConfigValues(packageName: string): Observable<string>;

    rm(directoryPath: string, directoryToBeSkipped: string): Observable<void>;

    openPlayStore(appId: string): Observable<void>;

    getDeviceAPILevel(): Observable<any>;

    checkAppAvailability(packageName: string): Observable<any>;

    getDownloadDirectoryPath(): Observable<string>;

    exportApk(): Observable<void>;

    getUtmInfo(): Observable<any>;

    clearUtmInfo(): Observable<any>;

    copyDirectory(sourceDirectory: string, destinationDirectory: string): Observable<void>;

    renameDirectory(sourceDirectory: string, toDirectoryName: string): Observable<void>;

    getFreeUsableSpace(directory: string): Observable<string>;

    canWrite(directory: string): Observable<string>;

    createDirectories(parentDirectoryPath: string, listOfFolder: string[]): Observable<void>;

    writeFile(fileMapList: any[]): Observable<void>;

    getMetaData(fileMapList: any[]): Observable<any>;

    getDeviceSpec(): Observable<DeviceSpecification>;

    getAvailableInternalMemorySize(): Observable<string>;

    getStorageVolumes(): Observable<{
        availableSize: number;
        totalSize: number;
        state: string;
        path: string;
        contentStoragePath: string;
        isRemovable: boolean;
    }[]>;
}
