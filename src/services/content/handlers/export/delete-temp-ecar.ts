import {FileService} from '../../../../native/file/def/file-service';
import {ExportContentContext} from '../../index';
import {Response} from '../../../../native/http';
import {ContentErrorCode} from '../../util/content-constants';

export class DeleteTempEcar {

    constructor(private fileService: FileService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.removeRecursively(exportContentContext.tmpLocationPath!).then(() => {
            response.body = exportContentContext;
            return response;
        }).catch(() => {
            response.errorMesg = ContentErrorCode.EXPORT_FAILED_DELETING_ECAR;
            throw response;
        });
    }
}
