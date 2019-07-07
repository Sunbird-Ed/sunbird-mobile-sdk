import {BuildConfigReader} from '..';
import {Observable, Observer} from 'rxjs';
import {injectable} from 'inversify';
import {DeviceSpecification} from '../../../services/telemetry';

@injectable()
export class AndroidBuildConfigReader implements BuildConfigReader {
    canWrite(directory: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.canWrite(directory, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    copyDirectory(sourceDirectory: string, destinationDirectory: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            buildconfigreader.copyDirectory(sourceDirectory, destinationDirectory, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    createDirectories(parentDirectoryPath: string, listOfFolder: string[]): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            buildconfigreader.createDirectories(parentDirectoryPath, listOfFolder, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getAvailableInternalMemorySize(): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.getAvailableInternalMemorySize((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getBuildConfigValue(packageName: string, property: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.getBuildConfigValue(packageName, property, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getBuildConfigValues(packageName: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.getBuildConfigValues(packageName, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getDeviceSpec(): Observable<any> {
        return Observable.create((observer: Observer<DeviceSpecification>) => {
            buildconfigreader.getDeviceSpec((success) => {
                observer.next(success);
                observer.complete();
            });
        });
    }

    getFreeUsableSpace(directory: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.getFreeUsableSpace(directory, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getMetaData(fileMapList: any[]): Observable<any> {
        return Observable.create((observer: Observer<string>) => {
            buildconfigreader.getMetaData(fileMapList, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getStorageVolumes(): Observable<{
        availableSize: number;
        totalSize: number;
        state: string;
        path: string;
        contentStoragePath: string;
        isRemovable: boolean;
    }[]> {
        return Observable.create((observer: Observer<{
            availableSize: number;
            totalSize: number;
            state: string;
            path: string;
            contentStoragePath: string;
            isRemovable: boolean;
        }[]>) => {
            buildconfigreader.getStorageVolumes((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    renameDirectory(sourceDirectory: string, toDirectoryName: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            buildconfigreader.renameDirectory(sourceDirectory, toDirectoryName, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    rm(directoryPath: string, directoryToBeSkipped: string): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            buildconfigreader.rm(directoryPath, directoryToBeSkipped, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    writeFile(fileMapList: any[]): Observable<void> {
        return Observable.create((observer: Observer<void>) => {
            buildconfigreader.writeFile(fileMapList, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    checkAppAvailability(packageName: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.checkAppAvailability(packageName, () => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    clearUtmInfo(): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.clearUtmInfo((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    exportApk(): Observable<void> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.exportApk((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getDeviceAPILevel(): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.getDeviceAPILevel((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getDownloadDirectoryPath(): Observable<string> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.getDownloadDirectoryPath((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    getUtmInfo(): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.getUtmInfo((success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }

    openPlayStore(appId: string): Observable<void> {
        return Observable.create((observer: Observer<any>) => {
            buildconfigreader.openPlayStore(appId, (success) => {
                observer.next(success);
                observer.complete();
            }, (error) => {
                observer.error(error);
                observer.complete();
            });
        });
    }
}
