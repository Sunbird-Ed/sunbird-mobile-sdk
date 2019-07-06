import {ExportTelemetryContext} from '../../index';
import {Response} from '../../../../native/http';
import {DbService} from '../../../../native/db';

export class CopyDatabase {
    constructor(private dbService: DbService) {
    }

    public async execute(exportContext: ExportTelemetryContext): Promise<Response> {
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
