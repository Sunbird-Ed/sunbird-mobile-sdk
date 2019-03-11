import {DbService} from '../../../db';
import {ExportTelemetryContext} from '../..';
import {TelemetryProcessedEntry} from '../../db/schema';
import {Response} from '../../../api';

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
