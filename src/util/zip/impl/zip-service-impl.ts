import {ZipService} from '../def/zip-service';
import {Entry, EntryCallback, ErrorCallback, FileError, FileSystem, LocalFileSystem} from '../../file';

declare var zip: {
    unzip(sourceZip: string, destUrl: string, successCallback, progressCallBack);

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

}
