import {DbService} from '../../../../native/db';
import {ImportTelemetryContext} from '../../index';
import {TelemetryProcessedEntry} from '../../db/schema';
import {Response} from '../../../../native/http';

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
