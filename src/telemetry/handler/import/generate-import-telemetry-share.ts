import {
    ImportTelemetryContext,
    Item,
    ShareDirection,
    ShareItemType,
    ShareType,
    TelemetryService,
    TelemetryShareRequest
} from '../..';
import {Response} from '../../../api';
import {DbService} from '../../../db';
import {ImportedMetadataEntry} from '../../../profile/db/schema';

export class GenerateImportTelemetryShare {
    constructor(private dbService: DbService,
                private telemetryService: TelemetryService) {
    }

    public execute(importContext: ImportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: ImportedMetadataEntry.TABLE_NAME
        }).toPromise().then((results: ImportedMetadataEntry.SchemaMap[]) => {
            const items: Item[] = [];
            results.forEach((result: ImportedMetadataEntry.SchemaMap) => {
                const item: Item = {
                    type: ShareItemType.TELEMETRY,
                    origin: result[ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID],
                    identifier: result[ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID],
                    pkgVersion: 0,
                    transferCount: 0,
                    size: ''
                };
                items.push(item);
            });
            const req: TelemetryShareRequest = {
                dir: ShareDirection.IN,
                type: ShareType.FILE.valueOf(),
                items: items,
                env: 'sdk'
            };
            return this.telemetryService.share(req).toPromise();
        }).then(() => {
            response.body = importContext;
            return response;
        });

    }
}
