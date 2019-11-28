import {Response} from '../../../api';
import {DbService} from '../../../db';
import {ExportProfileContext} from '../../def/export-profile-context';

export class CopyDatabase {
    constructor(private dbService: DbService) {
    }

    public async execute(exportContext: ExportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.copyDatabase(exportContext.destinationDBFilePath!).toPromise().then((success: boolean) => {
            response.body = exportContext;
            return response;
        }).then(() => {
            response.body = exportContext;
            return response;
        });

        return response;
    }
}
