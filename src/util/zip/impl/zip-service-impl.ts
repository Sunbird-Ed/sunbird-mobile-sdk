import {ZipService} from '../def/zip-service';
import {Entry, EntryCallback, ErrorCallback, FileError, FileSystem, LocalFileSystem} from '../../file';

declare var zip: {
    unzip(sourceZip: string, destUrl: string, successCallback, progressCallBack);

    zip(sourceFolderPath: string, zipFilePath: string, directoriesToBeSkipped: string[], filesToBeSkipped: string[], successCallback);

};

export class ZipServiceImpl implements ZipService {
    unzip(sourceZip: string, destUrl: string, onProgress?: Function): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                zip.unzip(sourceZip, destUrl, () => {
                }, () => {
                });

            } catch (xc) {
                reject(xc);
            }
        });
    }

    zip(sourceFolderPath: string, zipFilePath: string, directoriesToBeSkipped: string[], filesToBeSkipped: string[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                zip.zip(sourceFolderPath, zipFilePath, directoriesToBeSkipped, filesToBeSkipped, () => {
                    resolve();
                });

            } catch (xc) {
                reject(xc);
            }
        });
    }

}
