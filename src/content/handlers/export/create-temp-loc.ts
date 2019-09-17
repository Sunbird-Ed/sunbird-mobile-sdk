import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import {UniqueId} from '../../../db/util/unique-id';
import {DirectoryEntry} from '../../../util/file';

export class CreateTempLoc {

    constructor(private fileService: FileService) {
    }

    execute(exportContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.createDir(exportContext.tmpLocationPath!.concat(UniqueId.generateUniqueId()), false)
            .then((directoryEntry: DirectoryEntry) => {
                exportContext.tmpLocationPath = directoryEntry.nativeURL;
                response.body = exportContext;
                return Promise.resolve(response);
            }).catch(() => {
                return Promise.reject(response);
            });
    }
}
