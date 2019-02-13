import {FileService} from '../../../util/file/def/file-service';
import {ImportContentContext} from '../..';
import {Response} from '../../../api';

export class EcarCleanup {

    constructor(private fileService: FileService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.getTempLocation(importContentContext.destinationFolder).then((tempLocation) => {
            return this.fileService.removeRecursively(tempLocation.toURL());
        }).then(() => {
            return Promise.resolve(response);
        });
    }
}
