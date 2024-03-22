import {ZipService} from '../def/zip-service';
import {injectable} from 'inversify';

@injectable()
export class ZipServiceImpl implements ZipService {
    unzip(sourceZip: string, option, successCallback?, errorCallback?) {
        window.JJzip.unzip(sourceZip, option, () => {
            if (successCallback) {
                successCallback();
            }
        }, (e) => {
            if (errorCallback) {
                errorCallback(e);
            }
        });
    }

    zip(sourceFolderPath: string, option, directoriesToBeSkipped: string[], filesToBeSkipped: string[], successCallback?, errorCallback?) {
        window.JJzip.zip(sourceFolderPath, option, directoriesToBeSkipped, filesToBeSkipped, () => {
            if (successCallback) {
                successCallback();
            }
        }, (e) => {
            if (errorCallback) {
                errorCallback(e);
            }
        });
    }
}
