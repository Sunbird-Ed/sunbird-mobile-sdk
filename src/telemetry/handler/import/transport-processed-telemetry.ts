import {DbService} from '../../../db';
import {ImportTelemetryContext} from '../..';
import {TelemetryProcessedEntry} from '../../db/schema';
import {Response} from '../../../api';

export class TransportProcessedTelemetry {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: TelemetryProcessedEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise().then((results: TelemetryProcessedEntry.SchemaMap[]) => {
            return this.saveProccessedTelemetryToDB(results);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveProccessedTelemetryToDB(results: TelemetryProcessedEntry.SchemaMap[]) {
        results.forEach(async (result: TelemetryProcessedEntry.SchemaMap) => {
            await this.dbService.insert({
                table: TelemetryProcessedEntry.TABLE_NAME,
                modelJson: result
            });
        });
    }
}
