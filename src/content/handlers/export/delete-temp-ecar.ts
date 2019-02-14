import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import {ErrorCode} from '../../util/content-constants';

export class DeleteTempEcar {

    constructor(private fileService: FileService) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.removeRecursively(exportContentContext.tmpLocationPath).then(() => {
            response.body = exportContentContext;
            return Promise.resolve(response);
        }).catch(() => {
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
            return Promise.resolve(response);
        });
    }
}
