import {ImportContentContext} from '..';
import {Response} from '../../api';
import {FileUtil} from '../../util/file/util/file-util';
import {ErrorCode} from '../util/content-constants';
import {FileService} from '../../util/file/def/file-service';
import {ZipService} from '../../util/zip/def/zip-service';

export class ExtractEcar {
    private readonly FILE_SIZE = 'FILE_SIZE';

    constructor(private fileService: FileService,
                private zipService: ZipService) {
    }

    execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        let size: number;
        return this.fileService.getMetaData(importContext.ecarFilePath).then((metaData) => {
            size = metaData.size;
            return this.fileService.getTempLocation(importContext.destinationFolder);
        }).then((directoryEntry) => {
            this.zipService.unzip(importContext.ecarFilePath, directoryEntry.toURL());
            importContext.metadata.FILE_SIZE = size;
            response.body = importContext;
            return Promise.resolve(response);
        }).catch(error => {
            response.errorMesg = ErrorCode.IMPORT_FAILED_EXTRACT_ECAR.valueOf();
            return Promise.reject(response);
        });
    }
}
