import {FileService} from '../../../util/file/def/file-service';
import {ImportContentContext} from '../..';
import {Response} from '../../../api';
import {DbService} from '../../../db';

export class UpdateSizeOnDevice {

    constructor(private dbService: DbService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        response.body = importContentContext;
        return Promise.resolve(response);
    }
}
