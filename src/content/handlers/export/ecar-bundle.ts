import {FileService} from '../../../util/file/def/file-service';
import {ZipService} from '../../../util/zip/def/zip-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import {ErrorCode} from '../../util/content-constants';

export class EcarBundle {
    private static readonly FILE_SIZE = 'FILE_SIZE';

    constructor(private fileService: FileService,
                private zipService: ZipService) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.zipService.zip(exportContentContext.tmpLocationPath!, exportContentContext.ecarFilePath!).then(() => {

            return this.fileService.getMetaData(exportContentContext.ecarFilePath!);
        }).then((metaData) => {
            exportContentContext.metadata[EcarBundle.FILE_SIZE] = metaData.size;
            response.body = exportContentContext;
            return Promise.resolve(response);
        }).catch(() => {
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
            return Promise.reject(response);
        });
    }

}
