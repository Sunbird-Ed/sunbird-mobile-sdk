import {ZipService} from '../def/zip-service';
import {Entry, EntryCallback, ErrorCallback, FileError, FileSystem, LocalFileSystem} from '../../file';

declare var JJzip: {
    unzip(sourceZip: string, option, successCallback, errorCallback);

    zip(directoryPath: string, option, directoriesToBeSkipped: string[], filesToBeSkipped: string[], successCallback, errorCallback);

};

export class ZipServiceImpl implements ZipService {
    unzip(sourceZip: string, option, successCallback?, errorCallback?) {
        JJzip.unzip(sourceZip, option, () => {
            if (successCallback) {
                successCallback();
            }
        }, () => {
            if (errorCallback) {
                errorCallback();
            }
        });
    }

    zip(sourceFolderPath: string, option, directoriesToBeSkipped: string[], filesToBeSkipped: string[],
        successCallback?, errorCallback?) {
        JJzip.zip(sourceFolderPath, option, directoriesToBeSkipped, filesToBeSkipped, () => {
            if (successCallback) {
                successCallback();
            }
        }, () => {
            if (errorCallback) {
                errorCallback();
            }
        });
    }

}
