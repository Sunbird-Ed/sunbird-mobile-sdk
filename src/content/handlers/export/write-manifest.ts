import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import {ErrorCode} from '../../util/content-constants';
import {ExportContentContext} from '../..';

export class WriteManifest {

    private static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private fileService: FileService) {

    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.getFreeDiskSpace().then((deviceUsableSpace) => {
            if (deviceUsableSpace > 0 && deviceUsableSpace < (1024 * 1024)) {
                response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
                return Promise.reject(response);
            }
            return this.fileService.writeFile(exportContentContext.tmpLocationPath,
                WriteManifest.MANIFEST_FILE_NAME,
                JSON.stringify(exportContentContext.manifest),
                {replace: true});
        }).then(() => {
            return Promise.resolve(response);
        }).catch(() => {
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
            return Promise.reject(response);
        });
    }
}
