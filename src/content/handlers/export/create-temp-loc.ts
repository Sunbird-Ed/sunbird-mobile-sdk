import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';

export class CreateTempLoc {

    constructor(private fileService: FileService) {
    }

    execute(exportContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.createDir(exportContext.tmpLocationPath!, true).then(() => {
            return Promise.resolve(response);
        }).catch(() => {
            return Promise.reject(response);
        });
    }
}
