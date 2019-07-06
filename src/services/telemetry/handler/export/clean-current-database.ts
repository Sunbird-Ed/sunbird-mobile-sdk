import {DbService} from '../../../../native/db';
import {ExportTelemetryContext} from '../../index';
import {TelemetryProcessedEntry} from '../../db/schema';
import {Response} from '../../../../native/http';

export class CleanCurrentDatabase {
    constructor(private dbService: DbService) {
    }

    public execute(exportContext: ExportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.execute(`DELETE FROM ${TelemetryProcessedEntry.TABLE_NAME}`).toPromise().then(() => {
            response.body = exportContext;
            return response;
        });
    }
}
