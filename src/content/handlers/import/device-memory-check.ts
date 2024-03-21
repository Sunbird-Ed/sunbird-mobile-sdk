import {FileService} from '../../../util/file/def/file-service';
import {ImportContentContext} from '../..';
import {FileUtil} from '../../../util/file/util/file-util';
import {Response} from '../../../api';
import {ContentErrorCode} from '../../util/content-constants';

export class DeviceMemoryCheck {
    freeDiskSpace: number;

    constructor(private fileService: FileService) {
    }

    execute(importContext: ImportContentContext): Promise<Response> {
        return this.fileService.getFreeDiskSpace().then((size) => {
            this.freeDiskSpace = size;
            return this.fileService.getMetaData(importContext.ecarFilePath);
        }).then((metaData) => {
            const bufferSize = this.calculateBufferSize(metaData.size);
            const response: Response = new Response();
            if (!FileUtil.isFreeSpaceAvailable(this.freeDiskSpace, metaData.size, bufferSize)) {
                response.errorMesg = ContentErrorCode.IMPORT_FAILED_DEVICE_MEMORY_FULL.valueOf();
                return Promise.reject(response);
            }
            return Promise.resolve(response);
        }).catch((err) => {
            return Promise.reject(err);
        });
    }

    calculateBufferSize(ecarFileSize: number) {
        let bufferSize = 0;
        if (ecarFileSize > 0) {
            bufferSize = ecarFileSize / 4;
        }
        return bufferSize;
    }
}
