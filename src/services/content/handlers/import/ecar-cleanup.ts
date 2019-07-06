import {FileService} from '../../../../native/file/def/file-service';
import {ImportContentContext} from '../../index';
import {Response} from '../../../../native/http';

export class EcarCleanup {

    constructor(private fileService: FileService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.removeRecursively(importContentContext.tmpLocation!)
            .then(() => {
                response.body = importContentContext;
                return Promise.resolve(response);
            }).catch(() => {
                return Promise.reject(response);
            });
    }
}
